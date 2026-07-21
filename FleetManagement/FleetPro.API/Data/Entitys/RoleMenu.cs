using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("role_menu")]
    public class RoleMenu
    {
        [Column("role_id")]
        public int RoleId { get; set; }

        [Column("menu_id")]
       public string MenuId { get; set; } = string.Empty;
    }
}
