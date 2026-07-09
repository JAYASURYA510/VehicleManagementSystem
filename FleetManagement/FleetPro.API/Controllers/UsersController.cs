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
[Authorize]
public class UsersController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    [RequirePermission(AppModule.Users, "Read")]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await db.Users
            .Include(u => u.Permissions)
            .Include(u => u.AssignedVehicles)
            .OrderBy(u => u.Username)
            .ToListAsync();
        return Ok(users.Select(MapUser));
    }

    [HttpGet("{id}")]
    [RequirePermission(AppModule.Users, "Read")]
    public async Task<ActionResult<UserDto>> Get(int id)
    {
        var user = await db.Users
            .Include(u => u.Permissions)
            .Include(u => u.AssignedVehicles)
            .FirstOrDefaultAsync(u => u.Id == id);
        return user is null ? NotFound() : Ok(MapUser(user));
    }

    [HttpPost]
    [RequirePermission(AppModule.Users, "Write")]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new { message = "Username already exists" });

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = request.Role,
            IsActive = true
        };

        foreach (var p in request.Permissions)
        {
            user.Permissions.Add(new UserPermission
            {
                Module = p.Module,
                CanView = p.CanView,
                CanRead = p.CanRead,
                CanWrite = p.CanWrite,
                CanEdit = p.CanEdit
            });
        }

        foreach (var vehicleId in request.AssignedVehicleIds.Distinct())
            user.AssignedVehicles.Add(new UserVehicle { VehicleId = vehicleId });

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = user.Id }, MapUser(user));
    }

    [HttpPut("{id}")]
    [RequirePermission(AppModule.Users, "Edit")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await db.Users
            .Include(u => u.Permissions)
            .Include(u => u.AssignedVehicles)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound();
        if (user.Role == UserRole.SuperAdmin && !User.IsInRole(UserRole.SuperAdmin.ToString()))
            return Forbid();

        user.Email = request.Email;
        user.FullName = request.FullName;
        user.Role = request.Role;
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        db.UserPermissions.RemoveRange(user.Permissions);
        foreach (var p in request.Permissions)
        {
            user.Permissions.Add(new UserPermission
            {
                Module = p.Module,
                CanView = p.CanView,
                CanRead = p.CanRead,
                CanWrite = p.CanWrite,
                CanEdit = p.CanEdit
            });
        }

        db.UserVehicles.RemoveRange(user.AssignedVehicles);
        foreach (var vehicleId in request.AssignedVehicleIds.Distinct())
            user.AssignedVehicles.Add(new UserVehicle { VehicleId = vehicleId });

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [RequirePermission(AppModule.Users, "Edit")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        if (user.Role == UserRole.SuperAdmin) return BadRequest(new { message = "Cannot delete Super Admin" });
        user.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static UserDto MapUser(User user) => new(
        user.Id, user.Username, user.Email, user.FullName, user.Role, user.IsActive,
        AuthService.GetEffectivePermissions(user),
        user.AssignedVehicles.Select(uv => uv.VehicleId).ToList());
}
