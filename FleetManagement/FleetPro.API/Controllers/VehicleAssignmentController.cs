using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using FleetPro.API.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class VehicleAssignmentController : ControllerBase
    {
        private readonly IVehicleAssignmentRepository vehicleAssignmentRepository;

        public VehicleAssignmentController(IVehicleAssignmentRepository vehicleAssignmentRepository)
        {
            this.vehicleAssignmentRepository = vehicleAssignmentRepository;
        }
        [HttpGet("getAllAssignedVehicle")]
        public async Task<IActionResult> getAllData()
        {
            var getData = await vehicleAssignmentRepository.getAllAssignedVehicle();
            if(getData != null)
            {
                return Ok(new
                {
                    success = true,
                    message = getData,
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Assigned Vehicle Details Not Saved.",
                });
            }
        }

        [HttpPost("saveAssignedVehicle")]
        public async Task<IActionResult> Save([FromBody] VehicleUserAssignmentDto vehicleUserAssignmentDto)
        {
            var savedData = await vehicleAssignmentRepository.saveAssignedVehicle(vehicleUserAssignmentDto);
            if(savedData != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Assigned Vehicle Details saved successfully.",
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Assigned Vehicle Details Not Saved.",
                });
            }
        }

        [HttpGet("getUserBasedAssignedVehicle")]
        public async Task<IActionResult> getUserBasedVehicle()
        {
            try
            {
                var result = await vehicleAssignmentRepository.getUserBasedVehicle();

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
