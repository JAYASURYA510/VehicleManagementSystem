namespace FleetPro.API.DTOs
{
    public class VehicleAssignmentUserResponseDto
    {
        public int UserId { get; set; }

        public string UserName { get; set; }

        public int RoleId { get; set; }

        public string RoleName { get; set; }

        public List<VehicleAssignmentDetailDto> Assignments { get; set; } = new();
    }

    public class VehicleAssignmentDetailDto
    {
        public Guid AssignmentId { get; set; }

        public Guid VehicleId { get; set; }

        public string VehicleNumber { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public bool IsActive { get; set; }
    }
}

