namespace FleetPro.API.DTOs
{
    public class VehicleMstDto
    {
        public Guid? VehicleId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public int? VehicleTypeId { get; set; }
        public int? VehicleCategory { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string ChassisNumber { get; set; } = string.Empty;
        public int? FuelTypeId { get; set; }
        public string InsurancePolicyNo { get; set; } = string.Empty;
        public DateOnly? InsuranceExpiryDate { get; set; }
        public string RcNumber { get; set; } = string.Empty;
        public string FcNumber { get; set; } = string.Empty;
        public DateOnly? FcDate { get; set; }
        public int? VehicleStatusId { get; set; }
        public DateOnly? LastServiceDate { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime? created_date { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? updatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    }

    public class searchVehicleDto
    {
        public string? RegistrationNumber { get; set; }
        public int? VehicleTypeId { get; set; }
        public int? VehicleStatusId { get; set; }
        public string? searchTerm { get; set; }
    }
}
