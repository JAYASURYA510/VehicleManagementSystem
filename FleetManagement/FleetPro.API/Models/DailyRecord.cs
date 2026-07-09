namespace FleetPro.API.Models;

public class DailyRecord
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
    public DateTime Date { get; set; }
    public string? FuelStation { get; set; }
    public decimal DieselLitres { get; set; }
    public decimal DieselCost { get; set; }
    public decimal FromKm { get; set; }
    public decimal ToKm { get; set; }
    public decimal KmBeforeFueling { get; set; }
    public decimal TotalKm { get; set; }
    public decimal Mileage { get; set; }
    public decimal TollCharges { get; set; }
    public decimal InsuranceShare { get; set; }
    public decimal WorkshopExpenses { get; set; }
    public decimal TyreMaintenance { get; set; }
    public decimal DriverSalary { get; set; }
    public decimal RTOCharges { get; set; }
    public decimal TripRevenue { get; set; }
    public decimal TotalSpend { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
