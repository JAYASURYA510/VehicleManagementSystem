using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("role_menu")]
    public class RoleMenu
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Column("role_id")]
        public int RoleId { get; set; }

        [Column("menu_id")]
       public string MenuId { get; set; } = string.Empty;

        [Column("tenant_id")]
        public Guid? TenantId { get; set; }
    }
}
