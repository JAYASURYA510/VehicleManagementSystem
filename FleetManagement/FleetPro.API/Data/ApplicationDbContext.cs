using FleetPro.API.Data.Entitys;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserMst> UserMaster {  get; set; }
    public DbSet<MenuMst> MenuMsts { get; set; }
    public DbSet<RoleMst> RoleMsts { get; set; }
    public DbSet<RoleMenu> RoleMenus { get; set; }
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<DieselExpense> DieselExpenses => Set<DieselExpense>();
    public DbSet<TollCharge> TollCharges => Set<TollCharge>();
    public DbSet<TripDetail> TripDetails => Set<TripDetail>();
    public DbSet<Insurance> Insurances => Set<Insurance>();
    public DbSet<Workshop> Workshops => Set<Workshop>();
    public DbSet<Tyre> Tyres => Set<Tyre>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<RTOCharge> RTOCharges => Set<RTOCharge>();
    public DbSet<ProfitRecord> ProfitRecords => Set<ProfitRecord>();
    public DbSet<Master> Masters => Set<Master>();
    public DbSet<UserVehicle> UserVehicles => Set<UserVehicle>();
    public DbSet<DailyRecord> DailyRecords => Set<DailyRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.Permissions)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.RegistrationNumber)
            .IsUnique();

        modelBuilder.Entity<DieselExpense>()
            .HasOne(d => d.Vehicle)
            .WithMany()
            .HasForeignKey(d => d.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TollCharge>()
            .HasOne(t => t.Vehicle)
            .WithMany()
            .HasForeignKey(t => t.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TripDetail>()
            .HasOne(t => t.Vehicle)
            .WithMany()
            .HasForeignKey(t => t.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Insurance>()
            .HasOne(i => i.Vehicle)
            .WithMany()
            .HasForeignKey(i => i.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Workshop>()
            .HasOne(w => w.Vehicle)
            .WithMany()
            .HasForeignKey(w => w.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tyre>()
            .HasOne(t => t.Vehicle)
            .WithMany()
            .HasForeignKey(t => t.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Salary>()
            .HasOne(s => s.Vehicle)
            .WithMany()
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RTOCharge>()
            .HasOne(r => r.Vehicle)
            .WithMany()
            .HasForeignKey(r => r.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProfitRecord>()
            .HasOne(p => p.Vehicle)
            .WithMany()
            .HasForeignKey(p => p.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserVehicle>()
            .HasKey(uv => new { uv.UserId, uv.VehicleId });

        modelBuilder.Entity<UserVehicle>()
            .HasOne(uv => uv.User)
            .WithMany(u => u.AssignedVehicles)
            .HasForeignKey(uv => uv.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserVehicle>()
            .HasOne(uv => uv.Vehicle)
            .WithMany(v => v.AssignedUsers)
            .HasForeignKey(uv => uv.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DailyRecord>()
            .HasOne(d => d.Vehicle)
            .WithMany()
            .HasForeignKey(d => d.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RoleMenu>()
           .HasKey(x => new { x.RoleId, x.MenuId });
    }
}
