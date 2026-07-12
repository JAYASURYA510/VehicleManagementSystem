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
    public class MenuController : ControllerBase
    {
        private readonly IMenuRepository menuRepository;

        public MenuController(IMenuRepository menuRepository)
        {
            this.menuRepository = menuRepository;
        }

        [HttpGet("GetRoles")]
        public async Task<IActionResult> get()
        {
            var roles = await menuRepository.getrole();
            return Ok(roles);
        }

        [HttpGet("getAllMenu")]

        public async Task<IActionResult> getMenu()
        {
            var result = await menuRepository.getMenuTypes();

            return Ok(result);
        }
    }
}
