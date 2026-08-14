using AutoMapper;
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
    public class UserController : ControllerBase
    {
        private readonly IUserRepository userRepository;
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public UserController(IUserRepository userRepository, ApplicationDbContext context, IMapper mapper)
        {
            this.userRepository = userRepository;
            this.context = context;
            this.mapper = mapper;

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

        [HttpGet("getDriverDetailsOnly")]
        public async Task<List<UserDetailsDto>> GetDriverDetails(string roleId)
        {
           var roleData = await context.RoleMsts.Where(x => x.roleName == "Driver").AsNoTracking().FirstOrDefaultAsync();
           var driverData = await context.UserMaster.Where(x => x.role == roleData.id && x.is_active == true).AsNoTracking().ToListAsync();

           var result = mapper.Map<List<UserDetailsDto>>(driverData);

            if(result == null || result.Count == 0)
            {
                return new List<UserDetailsDto>();
            }

            return result;     
        }
    }

}
