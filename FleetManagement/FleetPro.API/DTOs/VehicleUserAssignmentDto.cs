namespace FleetPro.API.DTOs
{
    public class VehicleUserAssignmentDto
    {
        public List<Guid> VehicleId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime? created_date { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? updatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    }

    public class getVehicleAssignmentDto
    {
        public Guid VehicleId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime? created_date { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? updatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    }

    public class EditVehicleAssignmentDto
    {
        public Guid AssignmentId { get; set; }

        public Guid VehicleId { get; set; }

        public int UserId { get; set; }

        public int RoleId { get; set; }

        public DateTime? FromDate { get; set; }

        public bool IsActive { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }

    }

    public class VehicleAssignmentSearchDto
    {
       public Guid? VehicleId { get; set; }
       public DateTime? AssignedDate { get; set; }
       public string? searchTerm { get; set; }
       public int? RoleId { get; set; }
       public int? UserId { get; set; }
   }
}
