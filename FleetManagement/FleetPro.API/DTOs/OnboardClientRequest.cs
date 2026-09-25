namespace FleetPro.API.DTOs
{
    public class OnboardClientRequest
    {

        public string CustomerName { get; set; }

        public string UserName { get; set; }

        public string Password { get; set; }

        public string? EmailId { get; set; }

        public string? PhoneNo { get; set; }

        public string? Address { get; set; }

        public string? GstNo { get; set; }

        public string? PanNo { get; set; }

        public string IsSuperAdmin { get; set; }

        public DateTime CreatedDate { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }
    }

    public class AdminListResponse
    {
        public Guid TenantId { get; set; }

        public string CustomerName { get; set; }

        public string UserName { get; set; }

        public string? EmailId { get; set; }

        public string? PhoneNo { get; set; }

        public string? Address { get; set; }

        public string? GstNo { get; set; }

        public string? PanNo { get; set; }

        public string IsSuperAdmin { get; set; }

        public bool IsActive { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? CreatedBy { get; set; }
    }

    public class OnboardClientRequestForUpdate
    {
        public Guid TenantId { get; set; }

        public string CustomerName { get; set; }

        public string? EmailId { get; set; }

        public string? PhoneNo { get; set; }

        public string? Address { get; set; }

        public string? GstNo { get; set; }

        public string? PanNo { get; set; }

        public bool IsActive { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }
    }
}
