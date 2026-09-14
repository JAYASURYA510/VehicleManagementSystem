using FleetPro.API.Data.Entitys;

namespace FleetPro.API.DTOs
{
    public class DailyTrackingDto
    {
        public Guid Id { get; set; }
        public Guid VehicleId { get; set; }
        public DateTime TripDate { get; set; }
        public string? FromLocation { get; set; } 
        public string? ToLocation { get; set; }
        public string? FuelStation { get; set; }
        public decimal DieselLitres { get; set; }
        public decimal DieselCost { get; set; }
        public decimal? FromKm { get; set; } 
        public decimal? ToKm { get; set; }
        public decimal? KmBeforeFueling { get; set; }
        public decimal TollCharges { get; set; }
        public decimal WorkshopExpenses { get; set; }
        public decimal TyreMaintenance { get; set; }
        public decimal DriverSalary { get; set; }
        public decimal RtoCharges { get; set; }
        public decimal TripRevenue { get; set; }
        public decimal OtherExpenses { get; set; }
        public string? Notes { get; set; }
        public int? StatusType { get; set; }
        public bool IsDelete { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public ICollection<ImageAttachment> Images { get; set; } = new List<ImageAttachment>();
    }

    public class SaveDailyTrackingRequest
    {
        public Guid VehicleId { get; set; }

        public DateTime TripDate { get; set; }

        public string? FromLocation { get; set; }

        public string? ToLocation { get; set; }

        public string? FuelStation { get; set; }

        public decimal DieselLitres { get; set; }

        public decimal DieselCost { get; set; }

        public decimal? FromKm { get; set; }

        public decimal? ToKm { get; set; }

        public decimal? KmBeforeFueling { get; set; }

        public decimal? TollCharges { get; set; }

        public decimal? WorkshopExpenses { get; set; }

        public decimal? TyreMaintenance { get; set; }

        public decimal? DriverSalary { get; set; }

        public decimal? RtoCharges { get; set; }

        public decimal? TripRevenue { get; set; }

        public decimal? OtherExpenses { get; set; }

        public string? Notes { get; set; }

        public int? StatusType { get; set; }

        public int CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }

        public List<IFormFile>? Images { get; set; }

    }
}
