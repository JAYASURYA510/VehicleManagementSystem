using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("advance_salary_mst")]
    public class AdvanceSalaryMst
    {
        [Key]
        [Column("advance_id")]
        public Guid AdvanceId { get; set; }

        [Column("assigned_id")]
        public Guid AssignedId { get; set; }

        [Column("vehicle_id")]
        public Guid VehicleId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(10)]
        [Column("advance_amount")]
        public string AdvanceAmount { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        [Column("salary_amount")]
        public string SalaryAmount { get; set; } = string.Empty;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        [Column("created_date")]
        public DateTime? CreatedDate { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }

        [Column("updated_date")]
        public DateTime? UpdatedDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(AssignedId))]
        public virtual VehicleUserAssignment? VehicleUserAssignment { get; set; }

        [ForeignKey(nameof(VehicleId))]
        public virtual VehicleMst? Vehicle { get; set; }

        [ForeignKey(nameof(TenantId))]
        public virtual TenantMst? Tenant { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual UserMst? User { get; set; }
    }
}

