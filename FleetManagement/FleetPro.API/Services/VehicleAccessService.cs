using FleetPro.API.Authorization;
using FleetPro.API.Data;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FleetPro.API.Services;

public class VehicleAccessService(ApplicationDbContext db)
{
    public async Task<List<int>> GetAccessibleVehicleIdsAsync(ClaimsPrincipal user)
    {
        if (user.IsInRole(UserRole.SuperAdmin.ToString()) || user.IsInRole(UserRole.Admin.ToString()))
            return await db.Vehicles.Where(v => v.IsActive).Select(v => v.Id).ToListAsync();

        var userId = user.GetUserId();
        return null;
    }

    public async Task<bool> CanAccessVehicleAsync(ClaimsPrincipal user, int vehicleId)
    {
        var ids = await GetAccessibleVehicleIdsAsync(user);
        return ids.Contains(vehicleId);
    }

    public async Task<IQueryable<Vehicle>> FilterVehiclesAsync(ClaimsPrincipal user, IQueryable<Vehicle> query)
    {
        var ids = await GetAccessibleVehicleIdsAsync(user);
        return query.Where(v => ids.Contains(v.Id));
    }
}
