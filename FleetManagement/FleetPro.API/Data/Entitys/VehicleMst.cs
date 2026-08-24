using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("vehicle_mst")]
    public class VehicleMst
    {
        [Key]
        [Column("vehicle_id")]
        public Guid VehicleId { get; set; }

        [Required]
        [Column("registration_number")]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Column("vehicle_type_id")]
        public int? VehicleTypeId { get; set; }

        [Column("vehicle_category")]
        public int? VehicleCategory { get; set; }

        [Column("make")]
        public string Make { get; set; }

        [Column("model")]
        public string Model { get; set; }

        [Column("chassis_number")]
        public string ChassisNumber { get; set; } = string.Empty;

        [Column("fuel_type_id")]
        public int? FuelTypeId { get; set; }

        [Column("insurance_policy_no")]
        public string InsurancePolicyNo { get; set; } = string.Empty;

        [Column("insurance_expiry_date")]
        public DateOnly? InsuranceExpiryDate { get; set; }

        [Column("rc_number")]
        public string RcNumber { get; set; } = string.Empty;

        [Column("fc_number")]
        public string FcNumber { get; set; } = string.Empty;

        [Column("fc_date")]
        public DateOnly? FcDate { get; set; }

        [Column("vehicle_status_id")]
        public int? VehicleStatusId { get; set; }

        [Column("last_service_date")]
        public DateOnly? LastServiceDate { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; }

        [Column("created_date")]
        public DateTime? created_date { get; set; }

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        [Column("updated_date")]
        public DateTime? updatedDate { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }
    }
}
