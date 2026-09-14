using FleetPro.API.DTOs;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.Repository.DailyTracking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers.DailyTracking
{
    [Route("api/[controller]")]
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
        public async Task<IActionResult> SaveDailyTracking([FromForm] SaveDailyTrackingRequest request)
        {
            var id = await DailyTrackingRepository.SaveDailyTrackingAsync(request);

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
    }
}
