using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]/{tenantId}")]
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
        public async Task<List<VehicleMstDto>> Get(Guid tenantId)
        {
            var vehicleDEtails = await vehicleMstRepository.getAllVehicle(tenantId);
            if (vehicleDEtails == null || vehicleDEtails.Count == 0)
            {
                return new List<VehicleMstDto>();
            }
            return vehicleDEtails;
        }

        [HttpGet("getAllVehicleForDropDown")]
        public async Task<IActionResult> getVehicleForDropDown(Guid tenantId)
        {
            var getData = await context.VehicleMsts.AsNoTracking().Where(x =>x.TenantId == tenantId && x.IsAvailable == true).Select(
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
        public async Task<IActionResult> getActiveAllVehicle(Guid tenantId)
        {
            var getData = await context.VehicleMsts.Where(x => x.TenantId == tenantId && x.VehicleStatusId == 1 && x.IsAvailable == true).AsNoTracking().Select(
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
        public async Task<IActionResult> GetById(Guid tenantId, Guid VehicleId)
        {
            var vehicleDetails = await vehicleMstRepository.getVehicleById(tenantId, VehicleId);
            if (vehicleDetails != null)
            {
                return Ok(vehicleDetails);
            }
            return NotFound();
        }
        
        [HttpPost("SaveVehicleDetails")]
        public async Task<IActionResult> Save([FromBody] VehicleMstDto vehicle, Guid tenantId)
        {
            var result = await vehicleMstRepository.saveVehicle(tenantId, vehicle);
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
        public async Task<IActionResult> Update(Guid tenantId, Guid VehicleId, [FromBody] VehicleMstDto vehicle)
        {
            var result = await vehicleMstRepository.updateVehicle(tenantId, VehicleId, vehicle);
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
        public async Task<IActionResult> Delete(Guid tenantId, Guid VehicleId)
        {
            var result = await vehicleMstRepository.deleteVehicle(tenantId, VehicleId);
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
        public async Task<IActionResult> getSearchedData([FromBody] searchVehicleDto searchVehicleDto, Guid tenantId)
        {
            var vehicleData = await vehicleMstRepository.getsearchedVehicle(tenantId, searchVehicleDto);
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
