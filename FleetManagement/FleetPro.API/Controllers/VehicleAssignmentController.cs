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

        [HttpGet("getUserBasedAssignedVehicle/{RoleId}/{UserId}")]
        public async Task<IActionResult> getUserBasedVehicle(int RoleId, int UserId)
        {
            try
            {
                var result = await vehicleAssignmentRepository.getUserBasedVehicle(RoleId, UserId);

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

        [HttpGet("getUserBasedVehicleDropDown/{RoleId}/{UserId}")]
        public async Task<IActionResult> VehicleDropDown(int RoleId, int UserId)
        {
            var result = await vehicleAssignmentRepository.getUserBasedVehicleDropDown(RoleId, UserId);
            if (result != null)
            {
                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            else
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Not Found.",
                });
            }
        }

        [HttpPut("EditVehicleAssignment")]
        public async Task<IActionResult> EditVehicleAssignment([FromBody] EditVehicleAssignmentDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid request data."
                    });
                }

                var result = await vehicleAssignmentRepository.EditVehicleAssignmentAsync(request);
                if(result == true){
                return Ok(new
                {
                   success = result,
                   message = "Vehicle assignment updated successfully."
                });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Failed to update vehicle assignment."
                    });
                }
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

        [HttpDelete("DeleteVehicleAssignment/{assignmentId}")]
        public async Task<IActionResult> DeleteVehicleAssignment(Guid assignmentId)
        {
            try
            {
                var deleteAssignment = await vehicleAssignmentRepository.DeleteVehicleAssignmentAsync(assignmentId);
               if(deleteAssignment == true){
                return Ok(new
                {
                   success = deleteAssignment,
                   message = "Vehicle assignment deleted successfully."
                });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Failed to delete vehicle assignment."
                    });
                }
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while deleting data.", ex);
            }
        }

        [HttpPost("SearchVehicleAssignments")]
        public async Task<IActionResult> SearchVehicleAssignments([FromBody] VehicleAssignmentSearchDto request)
        {
            try
            {
                var result = await vehicleAssignmentRepository.SearchVehicleAssignmentsAsync(request);        
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

        [HttpGet("GetVehicleAssignmentById/{assignmentId}")]
        public async Task<IActionResult> GetVehicleAssignmentById(Guid assignmentId)
        {
            if (assignmentId == Guid.Empty)
            {
            return BadRequest(new
            {
                success = false,
                message = "Assignment ID is required."
            });
            }

            var result = await vehicleAssignmentRepository.GetVehicleAssignmentByIdAsync(assignmentId);

            if (result == null)
            {
            return NotFound(new
            {
                success = false,
                message = "Vehicle assignment not found."
            });
            }

             return Ok(new
            {
               success = true,
               data = result
            });
        }
    }
}
