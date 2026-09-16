using FleetPro.API.DTOs;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.IRepository.ITenant;
using FleetPro.API.Repository.TenantServ;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers.Tenant
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class TenantController : ControllerBase
    {
        private readonly ITenantServiceRepository TenantServiceRepository;

        public TenantController(ITenantServiceRepository TenantServiceRepository)
        {
            this.TenantServiceRepository = TenantServiceRepository;
        }

        [HttpGet("getSuperAdmin")]
        public async Task<IActionResult> getSuperAdmin()
        {
            var result = await TenantServiceRepository.getSuperAdminAsyc();
            if (result != null)
            {
                return Ok(new
                {
                    success = true,
                    message = result,
                });
            }
            else
            {
                 return NotFound(new
                {
                    success = true,
                    message = result,
                });
            }
        }

        [HttpPost("AddOnboardClient")]
        public async Task<IActionResult> OnboardClient([FromBody] OnboardClientRequest request)
        {
            try
            {
                var result = await TenantServiceRepository.OnboardClientAsync(request);
                if (!result.Success)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message
                    });
                }


                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    data = result.Data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message =
                        "Failed to create client account.",
                    error = ex.Message
                });
            }
        }
    }
}
