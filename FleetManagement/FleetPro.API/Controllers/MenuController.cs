using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
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
    public class MenuController : ControllerBase
    {
        private readonly IMenuRepository menuRepository;
        private readonly ApplicationDbContext context;

        public MenuController(IMenuRepository menuRepository, ApplicationDbContext context)
        {
            this.menuRepository = menuRepository;
            this.context = context;
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

        [HttpGet("GetMenuByRoleId/{roleId}")]
        public async Task<IActionResult> getMenu(int roleId)
        {
            var menus = await menuRepository.getNavMenu(roleId);
            return Ok(menus);
        }

        [HttpPost("SaveMenu")]
        public async Task<IActionResult> saveMenu(saveMenuDto menu)
        {
            var existingRecords = await context.RoleMenus.Where(x => x.RoleId == menu.RoleId).ToListAsync();

            context.RoleMenus.RemoveRange(existingRecords);

            var roleMenu = new RoleMenu
            {
                RoleId = menu.RoleId,
                MenuId = string.Join(",", menu.MenuIds)
            };

            context.RoleMenus.AddRange(roleMenu);
            await context.SaveChangesAsync();

            return Ok(new
            {
            Message = "Role menus saved successfully."
            });
        }
    }
}
