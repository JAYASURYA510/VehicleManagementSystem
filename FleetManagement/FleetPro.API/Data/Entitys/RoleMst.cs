using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("role_mst")]
    public class RoleMst
    {
        [Key]
        [Column("id")]
        public int id { get; set; }
        [Column("role_name")]
        public string roleName { get; set; }

    }
}
