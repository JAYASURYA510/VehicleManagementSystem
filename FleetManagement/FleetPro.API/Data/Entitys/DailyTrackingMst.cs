using FleetPro.API.Data.Entitys;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("dailytracking_records")]
public class DailyTrackingRecord
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("vehicle_id")]
    [ForeignKey(nameof(VehicleMst))]
    public Guid VehicleId { get; set; }
    public VehicleMst VehicleMst { get; set; }

    [Column("trip_date")]
    public DateTime TripDate { get; set; }

    [Column("from_location")]
    public string? FromLocation { get; set; }

    [Column("to_location")]
    public string? ToLocation { get; set; }

    [Column("fuel_station")]
    public string? FuelStation { get; set; }

    [Column("diesel_litres")]
    public decimal DieselLitres { get; set; }

    [Column("diesel_cost")]
    public decimal DieselCost { get; set; }

    [Column("from_km")]
    public decimal? FromKm { get; set; }

    [Column("to_km")]
    public decimal? ToKm { get; set; }

    [Column("km_before_fueling")]
    public decimal? KmBeforeFueling { get; set; }

    [Column("toll_charges")]
    public decimal TollCharges { get; set; }

    [Column("workshop_expenses")]
    public decimal WorkshopExpenses { get; set; }

    [Column("tyre_maintenance")]
    public decimal TyreMaintenance { get; set; }

    [Column("driver_salary")]
    public decimal DriverSalary { get; set; }

    [Column("rto_charges")]
    public decimal RtoCharges { get; set; }

    [Column("trip_revenue")]
    public decimal TripRevenue { get; set; }

    [Column("other_expenses")]
    public decimal OtherExpenses { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("status_type")]
    public int? StatusType { get; set; }

    [Column("is_delete")]
    public int IsDelete { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

}
