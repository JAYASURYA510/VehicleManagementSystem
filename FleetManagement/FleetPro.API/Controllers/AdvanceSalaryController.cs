using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FleetPro.API.Controllers
{
    [Route("api/[controller]/{tenantId}")]
    [Authorize]
    [ApiController]
    public class AdvanceSalaryController : ControllerBase
    {
        private readonly IAdvanceSalaryRepository advanceSalaryRepository;

        public AdvanceSalaryController(IAdvanceSalaryRepository advanceSalaryRepository)
        {
            this.advanceSalaryRepository = advanceSalaryRepository;
        }

        [HttpGet("getAllAdvanceSalary")]
        public async Task<IActionResult> GetAll(Guid tenantId)
        {
            try
            {
                var result = await advanceSalaryRepository.GetAllAdvanceSalariesAsync(tenantId);
                return Ok(new
                {
                    success = true,
                    message = "Advance salary records retrieved successfully.",
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

        [HttpGet("getAdvanceSalaryById/{advanceId}")]
        public async Task<IActionResult> GetById(Guid tenantId, Guid advanceId)
        {
            try
            {
                var result = await advanceSalaryRepository.GetAdvanceSalaryByIdAsync(tenantId, advanceId);
                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Advance salary record not found."
                    });
                }

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

        [HttpGet("getAdvanceSalaryByUserId/{userId}")]
        public async Task<IActionResult> GetByUserId(Guid tenantId, int userId)
        {
            try
            {
                var result = await advanceSalaryRepository.GetAdvanceSalariesByUserIdAsync(tenantId, userId);
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

        [HttpGet("getAdvanceSalaryByAssignId/{assignedId}")]
        public async Task<IActionResult> GetByAssignId(Guid tenantId, Guid assignedId)
        {
            try
            {
                var result = await advanceSalaryRepository.GetAdvanceSalaryByAssignIdAsync(tenantId, assignedId);
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

        [HttpPost("searchAdvanceSalary")]
        public async Task<IActionResult> Search(Guid tenantId, [FromBody] AdvanceSalarySearchDto request)
        {
            try
            {
                var result = await advanceSalaryRepository.SearchAdvanceSalariesAsync(tenantId, request);
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

        [HttpPost("saveAdvanceSalary")]
        public async Task<IActionResult> Save(Guid tenantId, [FromBody] CreateAdvanceSalaryDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid model state.",
                    errors = ModelState
                });
            }

            try
            {
                var result = await advanceSalaryRepository.SaveAdvanceSalaryAsync(tenantId, request);
                if (result != null)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Advance salary details saved successfully.",
                        data = result
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "Failed to save advance salary details."
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

        [HttpPut("updateAdvanceSalary")]
        public async Task<IActionResult> Update(Guid tenantId, [FromBody] UpdateAdvanceSalaryDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid model state.",
                    errors = ModelState
                });
            }

            try
            {
                var result = await advanceSalaryRepository.UpdateAdvanceSalaryAsync(tenantId, request);
                if (result)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Advance salary details updated successfully."
                    });
                }

                return NotFound(new
                {
                    success = false,
                    message = "Advance salary record not found or could not be updated."
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

        [HttpDelete("deleteAdvanceSalary/{advanceId}")]
        public async Task<IActionResult> Delete(Guid tenantId, Guid advanceId)
        {
            try
            {
                var result = await advanceSalaryRepository.DeleteAdvanceSalaryAsync(tenantId, advanceId);
                if (result)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Advance salary details deleted successfully."
                    });
                }

                return NotFound(new
                {
                    success = false,
                    message = "Advance salary record not found or could not be deleted."
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
