using FleetPro.API.Data;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Data;

public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext db)
    {
        if (await db.Users.AnyAsync()) return;

        var superAdmin = new User
        {
            Username = "superadmin",
            Email = "superadmin@fleetpro.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "Super Administrator",
            Role = UserRole.SuperAdmin,
            IsActive = true
        };
        db.Users.Add(superAdmin);

        var admin = new User
        {
            Username = "admin",
            Email = "admin@fleetpro.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "System Admin",
            Role = UserRole.Admin,
            IsActive = true,
            Permissions = Enum.GetValues<AppModule>().Select(m => new UserPermission
            {
                Module = m,
                CanView = true,
                CanRead = true,
                CanWrite = true,
                CanEdit = true
            }).ToList()
        };
        db.Users.Add(admin);

        var driver = new User
        {
            Username = "ramesh",
            Email = "ramesh@fleetpro.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
            FullName = "Ramesh Kumar",
            Role = UserRole.User,
            IsActive = true,
            Permissions =
            [
                new UserPermission { Module = AppModule.Dashboard, CanView = true, CanRead = true },
                new UserPermission { Module = AppModule.Diesel, CanView = true, CanRead = true, CanWrite = true }
            ]
        };
        db.Users.Add(driver);

        var v1 = new Vehicle { RegistrationNumber = "KA-01-MJ-1234", VehicleType = "Truck", Make = "Tata", Model = "LPT 1613", Year = 2022, DriverName = "Ramesh Kumar" };
        var v2 = new Vehicle { RegistrationNumber = "KA-03-MK-5678", VehicleType = "Truck", Make = "Tata", Model = "Signa 2823", Year = 2023, DriverName = "Suresh Singh" };
        var v3 = new Vehicle { RegistrationNumber = "KA-05-ML-9012", VehicleType = "Truck", Make = "Eicher", Model = "Eicher Pro 3015", Year = 2021, DriverName = "Anil Sharma" };
        db.Vehicles.AddRange(v1, v2, v3);
        await db.SaveChangesAsync();

        db.UserVehicles.Add(new UserVehicle { UserId = driver.Id, VehicleId = v1.Id });

        db.DailyRecords.AddRange(
            new DailyRecord
            {
                VehicleId = v1.Id, Date = DateTime.UtcNow.Date,
                FuelStation = "Indian Oil - Nelamangala", DieselLitres = 30, DieselCost = 2899,
                FromKm = 12000, ToKm = 12144, KmBeforeFueling = 12080, TotalKm = 144, Mileage = 4.8m,
                TollCharges = 500, InsuranceShare = 200, WorkshopExpenses = 0, TyreMaintenance = 0,
                DriverSalary = 500, RTOCharges = 0, TripRevenue = 50000, TotalSpend = 4099,
                CreatedByUserId = superAdmin.Id
            },
            new DailyRecord
            {
                VehicleId = v2.Id, Date = DateTime.UtcNow.Date.AddDays(-1),
                FuelStation = "HP Petrol - Tumkur Road", DieselLitres = 45, DieselCost = 4200,
                FromKm = 8000, ToKm = 8200, KmBeforeFueling = 8100, TotalKm = 200, Mileage = 4.44m,
                TollCharges = 800, InsuranceShare = 300, WorkshopExpenses = 1500, TyreMaintenance = 0,
                DriverSalary = 600, RTOCharges = 200, TripRevenue = 35000, TotalSpend = 7600,
                CreatedByUserId = admin.Id
            }
        );

        await db.SaveChangesAsync();
    }
}
