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
    }

}
