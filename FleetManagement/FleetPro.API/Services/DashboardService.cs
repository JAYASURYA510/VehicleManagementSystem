using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FleetPro.API.Services;

public class DashboardService(ApplicationDbContext db, VehicleAccessService vehicleAccess)
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(
        ClaimsPrincipal user, int? vehicleId, DateTime? from, DateTime? to)
    {
        var accessibleIds = await vehicleAccess.GetAccessibleVehicleIdsAsync(user);
        var vehicles = await db.Vehicles
            .Where(v => v.IsActive && accessibleIds.Contains(v.Id))
            .Where(v => !vehicleId.HasValue || v.Id == vehicleId)
            .ToListAsync();

        var vehicleIds = vehicles.Select(v => v.Id).ToList();

        var recordsQuery = db.DailyRecords.Where(d => vehicleIds.Contains(d.VehicleId));
        if (from.HasValue) recordsQuery = recordsQuery.Where(d => d.Date >= from.Value.Date);
        if (to.HasValue) recordsQuery = recordsQuery.Where(d => d.Date <= to.Value.Date);

        var records = await recordsQuery.ToListAsync();

        var totalSpend = records.Sum(r => r.TotalSpend);
        var totalReturns = records.Sum(r => r.TripRevenue);
        var totalLitres = records.Sum(r => r.DieselLitres);
        var avgMileage = records.Where(r => r.Mileage > 0).DefaultIfEmpty()
            .Average(r => r?.Mileage ?? 0);

        var summaries = vehicles.Select(v =>
        {
            var vRecords = records.Where(r => r.VehicleId == v.Id).ToList();
            var vSpend = vRecords.Sum(r => r.TotalSpend);
            var vReturns = vRecords.Sum(r => r.TripRevenue);
            var vLitres = vRecords.Sum(r => r.DieselLitres);
            var vMileage = vRecords.Where(r => r.Mileage > 0).DefaultIfEmpty().Average(r => r?.Mileage ?? 0);

            return new VehicleSummaryDto(
                v.Id, v.RegistrationNumber, v.DriverName,
                vRecords.Sum(r => r.DieselCost),
                vRecords.Sum(r => r.TollCharges),
                vRecords.Sum(r => r.WorkshopExpenses),
                vRecords.Sum(r => r.InsuranceShare),
                vRecords.Sum(r => r.TyreMaintenance),
                vRecords.Sum(r => r.DriverSalary),
                vRecords.Sum(r => r.RTOCharges),
                vSpend, vReturns, vReturns - vSpend, vLitres, vMileage);
        }).ToList();

        var trend = records
            .GroupBy(r => r.Date.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var spend = g.Sum(r => r.TotalSpend);
                var returns = g.Sum(r => r.TripRevenue);
                return new FinancialTrendPointDto(
                    g.Key.ToString("dd MMM"),
                    spend, returns, returns - spend);
            }).ToList();

        var distribution = summaries
            .Where(s => s.NetProfit != 0)
            .Select(s => new ProfitDistributionDto(s.RegistrationNumber, s.NetProfit))
            .ToList();

        return new DashboardSummaryDto(
            vehicles.Count,
            vehicles.Count(v => v.IsActive),
            totalSpend,
            totalReturns,
            totalReturns - totalSpend,
            totalLitres,
            Math.Round(avgMileage, 2),
            trend,
            distribution,
            summaries);
    }
}
