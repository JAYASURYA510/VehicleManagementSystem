using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FleetPro.API.Data.Entitys
{
    [Table("menu_mst")]
    public class MenuMst
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("menu_name")]
        public string MenuName { get; set; }

        [Column("icon")]
        public string? Icon { get; set; }

        [Column("route")]
        public string Route { get; set; }

        [Column("parent_id")]
        public int? ParentId { get; set; }
        [Column("parent_name")]
        public int? ParentName { get; set; }

        [Column("display_order")]
        public int DisplayOrder { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }
    }
}
