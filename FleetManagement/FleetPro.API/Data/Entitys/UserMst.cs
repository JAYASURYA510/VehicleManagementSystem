using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("user_mst")]
    public class UserMst
    {
        [Key]
        [Column("id")]
        public int userId { get; set; }
        [Column("username")]
        public string username { get; set; }
        [Column("password")]
        public string password { get; set; }
        [Column("full_name")]
        public string fullName { get; set; }
        [Column("emailid")]
        [EmailAddress]
        public string emailId { get; set; }
        [Column("phonenumber")]
        public string phoneNumber { get; set; }
        [Column("role")]
        [ForeignKey(nameof(RoleMst))]
        public int role {  get; set; }
        public RoleMst RoleMst { get; set; }
        public bool is_active { get; set; }
        [Column("createdby")]
        public int? createdBy { get; set; }
        [Column("updatedby")]
        public int? updatedBy { get; set; }
        [Column("created_at")]
        public DateTime? created_at { get; set; }
        [Column("updated_at")]
        public DateTime? updated_at { get; set; }
    }
}
