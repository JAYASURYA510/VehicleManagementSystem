using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FleetPro.API.DTOs
{
    public class UserDetailsDto
    { 
        public int userId { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public string fullName { get; set; }
        [EmailAddress]
        public string emailId { get; set; }
        public string phoneNumber { get; set; }
        public int role { get; set; }
        public bool is_active { get; set; }
        public int? createdBy { get; set; }
        public int? updatedBy { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }
    }

    public class userDatasDto
    {
        public int userId { get; set; }
        public string username { get; set; }
        public string fullName { get; set; }
        public string emailId { get; set; }
        public string phoneNumber { get; set; }
        public int role { get; set; }
        public bool is_active { get; set; }
    }
}
