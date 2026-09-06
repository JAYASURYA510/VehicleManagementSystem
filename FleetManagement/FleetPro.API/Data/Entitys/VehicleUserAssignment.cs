using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("vehicle_user_assignment")]
    public class VehicleUserAssignment
    {
        [Key]
        [Column("assignment_id")]
        public Guid AssignmentId { get; set; }
        [Column("vehicle_id")]
        public Guid VehicleId { get; set; }
        [Column("user_id")]
        public int UserId { get; set; }
        [Column("role_id")]
        public int RoleId { get; set; }
        [Column("from_date")]
        public DateTime FromDate { get; set; }
        [Column("to_date")]
        public DateTime ToDate { get; set; }
        [Column("is_active")]
        public bool IsActive { get; set; }
        [Column("created_date")]
        public DateTime? created_date { get; set; }

        [Column("created_by")]
        public int? CreatedBy { get; set; }

        [Column("updated_date")]
        public DateTime? updatedDate { get; set; }

        [Column("updated_by")]
        public int? UpdatedBy { get; set; }

        [ForeignKey(nameof(VehicleId))]
        public virtual VehicleMst Vehicle { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual UserMst User { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual RoleMst Role { get; set; }
    }
}
