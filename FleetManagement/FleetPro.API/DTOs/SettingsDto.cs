namespace FleetPro.API.DTOs
{
    /// <summary>
    /// Unified form model for uploading a logo.
    /// IFormFile is included here so Swashbuckle can generate
    /// the multipart/form-data schema from a single [FromForm] binding.
    /// </summary>
    public class UploadLogoRequestDto
    {
        /// <summary>The image file to upload (jpeg, png, gif, webp, svg).</summary>
        public IFormFile File { get; set; } = null!;

        /// <summary>Id of the user performing the operation.</summary>
        public int? CreatedBy { get; set; }
    }

    /// <summary>
    /// DTO returned after saving the logo and for GET responses.
    /// </summary>
    public class SettingsResponseDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? FileType { get; set; }
        public string ImageType { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
