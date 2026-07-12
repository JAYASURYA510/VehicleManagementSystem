using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FleetPro.API.Services;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 480;
    
}

public class AuthService(ApplicationDbContext db, JwtSettings jwtSettings)
{
    public async Task<LoginResponse?> LoginAsync2(LoginRequest request)
    {
        var user = await db.Users
            .Include(u => u.Permissions)
            .Include(u => u.AssignedVehicles)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var permissions = GetEffectivePermissions(user);
        var assignedVehicleIds = user.AssignedVehicles.Select(uv => uv.VehicleId).ToList();
        var token = GenerateToken(user, permissions);
        return new LoginResponse(token, user.Id, user.Username, user.FullName, user.Email, user.Role, permissions, assignedVehicleIds);
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await db.UserMaster
            .FirstOrDefaultAsync(u => u.username == request.Username && u.is_active == true);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.password))
            return null;

        var token = GenerateUserToken(user);
        return new LoginResponse(token, user.userId, user.username, user.fullName, user.emailId, (UserRole)user.role, new List<PermissionDto>(), new List<int>());
    }
    public static List<PermissionDto> GetEffectivePermissions(User user)
    {
        if (user.Role == UserRole.SuperAdmin)
        {
            return Enum.GetValues<AppModule>()
                .Select(m => new PermissionDto(m, true, true, true, true))
                .ToList();
        }

        return user.Permissions
            .Select(p => new PermissionDto(p.Module, p.CanView, p.CanRead, p.CanWrite, p.CanEdit))
            .ToList();
    }

    private string GenerateToken(User user, List<PermissionDto> permissions)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("fullName", user.FullName)
        };

        foreach (var p in permissions)
        {
            claims.Add(new Claim($"perm_{p.Module}", $"{p.CanView},{p.CanRead},{p.CanWrite},{p.CanEdit}"));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

     private string GenerateUserToken(UserMst user)
    {
         var claims = new List<Claim>
         {
            new(ClaimTypes.NameIdentifier, user.userId.ToString()),
             new(ClaimTypes.Name, user.username),
             new(ClaimTypes.Role, user.role.ToString()),
             new("fullName", user.fullName)
         };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
