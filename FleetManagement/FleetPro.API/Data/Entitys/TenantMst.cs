using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FleetPro.API.Data.Entitys
{
    [Table("tenant_mst")]
    public class TenantMst
    {
        [Key]
        [Column("tenant_id")]
        public Guid TenantId { get; set; }

        [Required]
        [Column("customer_id")]
        public string CustomerId { get; set; }

        [Required]
        [Column("user_name")]
        public string UserName { get; set; }

        [Required]
        [Column("password")]
        public string Password { get; set; }

        [Required]
        [Column("customer_name")]
        public string CustomerName { get; set; }

        [Column("email_id")]
        public string? EmailId { get; set; }

        [Column("phone_no")]
        public string? PhoneNo { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("gst_no")]
        public string? GstNo { get; set; }

        [Column("tan_no")]
        public string? TanNo { get; set; }

        [Required]
        [Column("is_super_admin")]
        public string IsSuperAdmin { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_date")]
        public DateTime CreatedDate { get; set; }

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        [Column("updated_date")]
        public DateTime? UpdatedDate { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }
    }
}
