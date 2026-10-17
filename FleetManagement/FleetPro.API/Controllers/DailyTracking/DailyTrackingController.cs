using FleetPro.API.DTOs;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.Repository.DailyTracking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers.DailyTracking
{
    [Route("api/[controller]/{tenantId}")]
    [Authorize]
    [ApiController]
    public class DailyTrackingController : ControllerBase
    {
        private readonly IDailyTrackingRepository DailyTrackingRepository;

        public DailyTrackingController(IDailyTrackingRepository DailyTrackingRepository)
        {
            this.DailyTrackingRepository = DailyTrackingRepository;
        }

        [HttpPost("SaveDailyTracking")]
        public async Task<IActionResult> SaveDailyTracking(Guid tenantId, [FromForm] SaveDailyTrackingRequest request)
        {
            var id = await DailyTrackingRepository.SaveDailyTrackingAsync(tenantId, request);

            if (id != Guid.Empty)
            {
                return Ok(new
                {
                   success = true,
                   message = "Daily tracking saved successfully.",
                   id = id
                });
            }

            return BadRequest();
        }

        [HttpPut("UpdateDailyTracking/{dailyTrackingId}")]
        public async Task<IActionResult> UpdateDailyTracking(Guid tenantId, Guid dailyTrackingId, [FromForm] SaveDailyTrackingRequest request)
        {
            var updated = await DailyTrackingRepository.UpdateDailyTrackingAsync(tenantId, dailyTrackingId, request);

            if (!updated)
            {
                return NotFound();
            }

            return Ok(new
            {
                success = true,
                message = "Daily tracking updated successfully.",
                id = dailyTrackingId
            });
        }

        [HttpDelete("DeleteDailyTracking/{dailyTrackingId}")]
        public async Task<IActionResult> DeleteDailyTracking(Guid tenantId, Guid dailyTrackingId)
        {
            var deleted = await DailyTrackingRepository.DeleteDailyTrackingAsync(tenantId, dailyTrackingId);

            if (!deleted)
            {
                return NotFound();
            }

            return Ok(new
            {
                success = true,
                message = "Daily tracking deleted successfully.",
                id = dailyTrackingId
            });
        }

        [HttpGet("GetDailyTrackingById/{dailyTrackingId}")]
        public async Task<IActionResult> GetDailyTrackingById(Guid tenantId, Guid dailyTrackingId)
        {
            var result = await DailyTrackingRepository.GetDailyTrackingByIdAsync(tenantId, dailyTrackingId);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPost("getDailyTrakingBySearch/{RoleId}/{UserId}")]
        public async Task<IActionResult> getDailyTracking(Guid tenantId, int RoleId, int UserId, [FromBody] DailyTrackingSearchRequest request)
        {
            var result = await DailyTrackingRepository.getDailyTrackingAsync(tenantId, RoleId, UserId, request);

            return Ok(result);
        }
    }
}
