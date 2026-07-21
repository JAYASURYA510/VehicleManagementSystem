using FleetPro.API.Authorization;
using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.Models;
using FleetPro.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        if (result is null) return Unauthorized(new { message = "Invalid username or password" });
        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
public class UserRoleController : ControllerBase
{
     private readonly ApplicationDbContext context;
     public UserRoleController(ApplicationDbContext context)
    {
        this.context = context;
    }
    [HttpGet("roleForLogin")]
    public async Task<ActionResult<List<RoleDto>>> GetAll()
    {
        var roleData = await context.RoleMsts.AsNoTracking().ToListAsync();
        return roleData.Select(data => new RoleDto
            {
                Id = data.id,
                RoleName = data.roleName
            }).ToList();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(DashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardSummaryDto>> Get(
        [FromQuery] int? vehicleId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to) =>
        Ok(await dashboardService.GetSummaryAsync(User, vehicleId, from, to));
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController(ApplicationDbContext db, VehicleAccessService vehicleAccess) : ControllerBase
{
    private bool CanManageVehicles() =>
        User.IsInRole(UserRole.SuperAdmin.ToString()) || User.IsInRole(UserRole.Admin.ToString());

    [HttpGet]
    public async Task<ActionResult<List<Vehicle>>> GetAll([FromQuery] bool? activeOnly = true)
    {
        var query = db.Vehicles.AsQueryable();
        if (activeOnly == true) query = query.Where(v => v.IsActive);
        query = await vehicleAccess.FilterVehiclesAsync(User, query);
        return Ok(null);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> Get(int id)
    {
        if (!await vehicleAccess.CanAccessVehicleAsync(User, id)) return Forbid();
        var vehicle = await db.Vehicles.FindAsync(id);
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> Create([FromBody] Vehicle vehicle)
    {
        if (!CanManageVehicles()) return Forbid();
        vehicle.CreatedAt = DateTime.UtcNow;
        db.Vehicles.Add(vehicle);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = vehicle.Id }, vehicle);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Vehicle vehicle)
    {
        if (!CanManageVehicles()) return Forbid();
        if (id != vehicle.Id) return BadRequest();
        db.Entry(vehicle).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!CanManageVehicles()) return Forbid();
        var vehicle = await db.Vehicles.FindAsync(id);
        if (vehicle is null) return NotFound();
        vehicle.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DailyRecordsController(DailyRecordService dailyRecordService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<DailyRecordListItemDto>>> GetAll(
        [FromQuery] int? vehicleId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to) =>
        Ok(await dailyRecordService.GetAllAsync(User, vehicleId, from, to));

    [HttpPost]
    public async Task<ActionResult<DailyRecord>> Create([FromBody] DailyRecordRequest request)
    {
        var record = await dailyRecordService.CreateAsync(User, request);
        if (record is null) return Forbid();
        return Ok(record);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await dailyRecordService.DeleteAsync(User, id)) return NotFound();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MastersController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<Master>>> GetAll([FromQuery] string? category) =>
        Ok(await db.Masters
            .Where(m => category == null || m.Category == category)
            .OrderBy(m => m.Category).ThenBy(m => m.Name)
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Master>> Get(int id)
    {
        var master = await db.Masters.FindAsync(id);
        return master is null ? NotFound() : Ok(master);
    }

    [HttpPost]
    public async Task<ActionResult<Master>> Create([FromBody] Master master)
    {
        master.CreatedAt = DateTime.UtcNow;
        db.Masters.Add(master);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = master.Id }, master);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Master master)
    {
        if (id != master.Id) return BadRequest();
        db.Entry(master).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var master = await db.Masters.FindAsync(id);
        if (master is null) return NotFound();
        db.Masters.Remove(master);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
