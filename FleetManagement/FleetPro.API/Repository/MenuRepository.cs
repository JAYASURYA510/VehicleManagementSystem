using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Writers;

namespace FleetPro.API.Repository
{
    public class MenuRepository : IMenuRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public MenuRepository(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<List<RoleDto>> getrole()
        {
            try{
            var roleData = await context.RoleMsts.AsNoTracking().ToListAsync();

            return roleData.Select(data => new RoleDto
            {
                Id = data.id,
                RoleName = data.roleName
            }).ToList();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<MenuTypesDto>> getMenuTypes()
        {
            try
            {
                var menuData = await context.MenuMsts.AsNoTracking().ToListAsync();
                return mapper.Map<List<MenuTypesDto>>(menuData);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<MenuDto>> getNavMenu(int roleId)
        {
            try
            {
                var roleMenu = await context.RoleMenus
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RoleId == roleId);

                if (roleMenu == null || string.IsNullOrWhiteSpace(roleMenu.MenuId))
                {
                    return new List<MenuDto>();
                }

                var menuIds = roleMenu.MenuId
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();

                var menus = await context.MenuMsts
                    .AsNoTracking()
                    .Where(x => menuIds.Contains(x.Id) && x.IsActive)
                    .OrderBy(x => x.DisplayOrder)
                    .Select(menu => new MenuDto
                    {
                        Id = menu.Id,
                        MenuName = menu.MenuName,
                        Icon = menu.Icon ?? string.Empty,
                        Route = menu.Route,
                        ParentId = menu.ParentId
                    })
                    .ToListAsync();

                var parents = menus
                    .Where(x => x.ParentId == null)
                    .ToList();

                foreach (var parent in parents)
                {
                    parent.Children = menus
                        .Where(x => x.ParentId == parent.Id)
                        .ToList();
                }

                return parents;
            }
            catch
            {
                throw;
            }
        }
    }
}
