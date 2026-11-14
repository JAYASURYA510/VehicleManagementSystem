using System.ComponentModel.DataAnnotations;

namespace FleetPro.API.DTOs
{
    public class AdvanceSalaryDto
    {
        public Guid AdvanceId { get; set; }
        public Guid AssignedId { get; set; }
        public Guid VehicleId { get; set; }
        public string? VehicleNumber { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public Guid TenantId { get; set; }
        public string AdvanceAmount { get; set; } = string.Empty;
        public string SalaryAmount { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class CreateAdvanceSalaryDto
    {
        [Required]
        public Guid AssignedId { get; set; }

        [Required]
        public Guid VehicleId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(10)]
        public string AdvanceAmount { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string SalaryAmount { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
    }

    public class UpdateAdvanceSalaryDto
    {
        [Required]
        public Guid AdvanceId { get; set; }

        [Required]
        public Guid AssignedId { get; set; }

        [Required]
        public Guid VehicleId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        [MaxLength(10)]
        public string AdvanceAmount { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string SalaryAmount { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class AdvanceSalarySearchDto
    {
        public Guid? AssignedId { get; set; }
        public Guid? VehicleId { get; set; }
        public int? UserId { get; set; }
        public Guid? TenantId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsActive { get; set; }
        public string? SearchTerm { get; set; }
    }
}

