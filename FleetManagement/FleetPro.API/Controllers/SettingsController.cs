using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]/{tenantId}")]
    [Authorize]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingRepository settingRepository;

        public SettingsController(ISettingRepository settingRepository)
        {
            this.settingRepository = settingRepository;
        }

        // POST api/settings/{tenantId}/saveSettings
        /// <summary>
        /// Upload (or replace) the logo for a tenant.
        /// Accepts multipart/form-data. Existing logo is soft-deleted automatically.
        /// </summary>
        [HttpPost("saveSettings")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Save(
            Guid tenantId,
            [FromForm] UploadLogoRequestDto request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "No file was provided." });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml" };
            if (!allowedTypes.Contains(request.File.ContentType.ToLower()))
                return BadRequest(new { message = "Invalid file type. Only image files are allowed." });

            try
            {
                var result = await settingRepository.SaveAsync(tenantId, request);
                return Ok(new { message = "Setting saved successfully.", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET api/settings/{tenantId}/settings
        /// <summary>
        /// Retrieve the active settings for a tenant.
        /// Returns 404 if no settings have been uploaded yet.
        /// </summary>
        [HttpGet("getSettings")]
        public async Task<IActionResult> Get(Guid tenantId)
        {
            try
            {
                var result = await settingRepository.GetAsync(tenantId);
                if (result == null)
                    return NotFound(new { message = "No settings found for this tenant." });

                return Ok(new { data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

