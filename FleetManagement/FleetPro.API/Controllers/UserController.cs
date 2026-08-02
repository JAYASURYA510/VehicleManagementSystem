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
    public class UserController : ControllerBase
    {
        private readonly IUserRepository userRepository;

        public UserController(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        [HttpGet("getUser")]
        public async Task<List<userDatasDto>> Get()
        {
            return await userRepository.getAllUser();
        }

        [HttpPost("SaveUser")]
        public async Task<UserDetailsDto> newUser(UserDetailsDto user)
        {
            return await userRepository.saveUser(user);
        }

        [HttpPut("EditUser/{id}")]
        public async Task<IActionResult> update(UserDetailsDto user)
        {
            var result = await userRepository.updateUser(user);
            if (result == "User updated successfully.")
            {
                return Ok(new
                {
                    success = true,
                    message = "User updated successfully."
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = result
                });
            }
        }

        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> delete(int id)
        {
            var result = await userRepository.deleteUser(id);
            if(result == "User Deleted Successfully")
            {
                return Ok(new
                {
                    success = true,
                    message = "User updated successfully."
                });
            }
            else
            {
                return BadRequest(new
                {
                    success = false,
                    message = result
                });
            }
        }
    }

}
