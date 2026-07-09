namespace FleetPro.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<UserPermission> Permissions { get; set; } = [];
    public ICollection<UserVehicle> AssignedVehicles { get; set; } = [];
}

public class UserPermission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public AppModule Module { get; set; }
    public bool CanView { get; set; }
    public bool CanRead { get; set; }
    public bool CanWrite { get; set; }
    public bool CanEdit { get; set; }
}
