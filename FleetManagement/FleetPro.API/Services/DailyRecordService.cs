using FleetPro.API.Authorization;
using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FleetPro.API.Services;

public class DailyRecordService(ApplicationDbContext db, VehicleAccessService vehicleAccess)
{
    public async Task<List<DailyRecordListItemDto>> GetAllAsync(ClaimsPrincipal user, int? vehicleId, DateTime? from, DateTime? to)
    {
        var accessibleIds = await vehicleAccess.GetAccessibleVehicleIdsAsync(user);
        var query = db.DailyRecords
            .Include(d => d.Vehicle)
            .Where(d => accessibleIds.Contains(d.VehicleId));

        if (vehicleId.HasValue) query = query.Where(d => d.VehicleId == vehicleId);
        if (from.HasValue) query = query.Where(d => d.Date >= from.Value.Date);
        if (to.HasValue) query = query.Where(d => d.Date <= to.Value.Date);

        return await query
            .OrderByDescending(d => d.Date)
            .Select(d => new DailyRecordListItemDto(
                d.Id, d.VehicleId, d.Vehicle.RegistrationNumber, d.Date,
                d.TotalSpend, d.TripRevenue, d.TripRevenue - d.TotalSpend, d.Notes))
            .ToListAsync();
    }

    public async Task<DailyRecord?> CreateAsync(ClaimsPrincipal user, DailyRecordRequest request)
    {
        if (!await vehicleAccess.CanAccessVehicleAsync(user, request.VehicleId))
            return null;

        var totalKm = request.ToKm - request.FromKm;
        var mileage = request.DieselLitres > 0 ? totalKm / request.DieselLitres : 0;
        var totalSpend = request.DieselCost + request.TollCharges + request.InsuranceShare +
            request.WorkshopExpenses + request.TyreMaintenance + request.DriverSalary + request.RTOCharges;

        var record = new DailyRecord
        {
            VehicleId = request.VehicleId,
            Date = request.Date.Date,
            FuelStation = request.FuelStation,
            DieselLitres = request.DieselLitres,
            DieselCost = request.DieselCost,
            FromKm = request.FromKm,
            ToKm = request.ToKm,
            KmBeforeFueling = request.KmBeforeFueling,
            TotalKm = totalKm,
            Mileage = mileage,
            TollCharges = request.TollCharges,
            InsuranceShare = request.InsuranceShare,
            WorkshopExpenses = request.WorkshopExpenses,
            TyreMaintenance = request.TyreMaintenance,
            DriverSalary = request.DriverSalary,
            RTOCharges = request.RTOCharges,
            TripRevenue = request.TripRevenue,
            TotalSpend = totalSpend,
            Notes = request.Notes,
            CreatedByUserId = user.GetUserId(),
            CreatedAt = DateTime.UtcNow
        };

        db.DailyRecords.Add(record);
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<bool> DeleteAsync(ClaimsPrincipal user, int id)
    {
        var record = await db.DailyRecords.FindAsync(id);
        if (record is null) return false;
        if (!await vehicleAccess.CanAccessVehicleAsync(user, record.VehicleId)) return false;
        db.DailyRecords.Remove(record);
        await db.SaveChangesAsync();
        return true;
    }
}
