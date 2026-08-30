using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class VehicleMstController : ControllerBase
    {
        private readonly IVehicleMstRepository vehicleMstRepository;
        private readonly ApplicationDbContext context;

        public VehicleMstController(IVehicleMstRepository vehicleMstRepository,ApplicationDbContext context)
        {
            this.vehicleMstRepository = vehicleMstRepository;
            this.context = context;
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

        [HttpGet("getAllVehicleForDropDown")]
        public async Task<IActionResult> getVehicleForDropDown()
        {
            var getData = await context.VehicleMsts.AsNoTracking().Select(
                x => new
                {
                    x.VehicleId,
                    x.RegistrationNumber
                }
            ).ToListAsync();
            if (getData != null)
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

        [HttpGet("getActiveAllVehicle")]
        public async Task<IActionResult> getActiveAllVehicle()
        {
            var getData = await context.VehicleMsts.Where(x => x.VehicleStatusId == 1).AsNoTracking().Select(
                x => new
                {
                    x.VehicleId,
                    x.RegistrationNumber
                }
            ).ToListAsync();
            if (getData != null)
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

        [HttpPost("getVehicleBySearch")]
        public async Task<IActionResult> getSearchedData([FromBody] searchVehicleDto searchVehicleDto)
        {
            var vehicleData = await vehicleMstRepository.getsearchedVehicle(searchVehicleDto);
            if (vehicleData != null)
            {
                return Ok(new
                {
                    success = true,
                    message = vehicleData,
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Not Found."
                });
            }
        }
    }
}
