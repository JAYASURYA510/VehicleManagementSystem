using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class VehicleMstController : ControllerBase
    {
        private readonly IVehicleMstRepository vehicleMstRepository;

        public VehicleMstController(IVehicleMstRepository vehicleMstRepository)
        {
            this.vehicleMstRepository = vehicleMstRepository;
        }

        [HttpGet("getAllVehicle")]
        public async Task<List<VehicleMstDto>> Get()
        {
            var vehicleDEtails = await vehicleMstRepository.getAllVehicle();
            if (vehicleDEtails == null || vehicleDEtails.Count == 0)
            {
                return new List<VehicleMstDto>();
            }
            return vehicleDEtails;
        }

        [HttpGet("getVehicleById/{VehicleId}")]
        public async Task<IActionResult> GetById(Guid VehicleId)
        {
            var vehicleDetails = await vehicleMstRepository.getVehicleById(VehicleId);
            if (vehicleDetails != null)
            {
                return Ok(vehicleDetails);
            }
            return NotFound();
        }
        
        [HttpPost("SaveVehicleDetails")]
        public async Task<IActionResult> Save([FromBody] VehicleMstDto vehicle)
        {
            var result = await vehicleMstRepository.saveVehicle(vehicle);
            if (result != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Vehicle details saved successfully.",
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to save vehicle details."
                });
            }
        }

        [HttpPut("UpdateVehicleDetails/{VehicleId}")]
        public async Task<IActionResult> Update(Guid VehicleId, [FromBody] VehicleMstDto vehicle)
        {
            var result = await vehicleMstRepository.updateVehicle(VehicleId, vehicle);
            if (result != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Vehicle details updated successfully.",
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to update vehicle details."
                });
            }
        }

        [HttpDelete("DeleteVehicleDetails/{VehicleId}")]
        public async Task<IActionResult> Delete(Guid VehicleId)
        {
            var result = await vehicleMstRepository.deleteVehicle(VehicleId);
            if (result)
            {
                return Ok(new
                {
                    success = true,
                    message = "Vehicle details deleted successfully.",
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Failed to delete vehicle details."
                });
            }
        }
    }
}
