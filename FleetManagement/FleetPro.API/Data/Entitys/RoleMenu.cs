using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("role_menu")]
    public class RoleMenu
    {
        [Column("role_id")]
        [ForeignKey(nameof(RoleMst))]
        public int RoleId { get; set; }
        public RoleMst RoleMst { get; set; }

        [Column("menu_id")]
        [ForeignKey(nameof(MenuMst))]
        public int MenuId { get; set; }
        public MenuMst MenuMst { get; set; }
    }
}
