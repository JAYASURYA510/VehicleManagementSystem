using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;

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
            var roleData = await context.RoleMsts.Where(x => x.id != 1).AsNoTracking().ToListAsync();

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

        public async Task<List<MenuDto>> getNavMenu(Guid tenantId, int roleId)
        {
            try
            {
                var roleMenu = await context.RoleMenus
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RoleId == roleId && x.TenantId == tenantId);

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
                        ParentId = menu.ParentId,
                        ParentName = menu.ParentName,
                        GrandparentId = menu.GrandparentId,
                        GrandparentName = menu.GrandparentName
                    })
                    .ToListAsync();


                var grouped = menus
                    .GroupBy(x => new { x.GrandparentId, x.GrandparentName })
                    .OrderBy(g => g.Key.GrandparentId)
                    .Select(gpGroup => new MenuDto
                    {
                        Id = gpGroup.Key.GrandparentId ?? 0,
                        MenuName = gpGroup.Key.GrandparentName ?? string.Empty,
                        Icon = string.Empty,
                        Route = string.Empty,
                        Level = 1,   // grandparent group
                        // Existing parent-grouping logic – preserved as-is inside each grandparent
                        Children = gpGroup
                            .GroupBy(x => new { x.ParentId, x.ParentName })
                            .OrderBy(g => g.Key.ParentId)
                            .Select(pGroup => new MenuDto
                            {
                                Id = pGroup.Key.ParentId ?? 0,
                                MenuName = pGroup.Key.ParentName ?? string.Empty,
                                Icon = string.Empty,
                                Route = string.Empty,
                                Level = 2,   // parent group
                                Children = pGroup.Select(item => new MenuDto
                                {
                                    Id = item.Id,
                                    MenuName = item.MenuName,
                                    Icon = item.Icon,
                                    Route = item.Route,
                                    ParentId = item.ParentId,
                                    ParentName = item.ParentName,
                                    GrandparentId = item.GrandparentId,
                                    GrandparentName = item.GrandparentName,
                                    Level = 3   // actual menu item (leaf)
                                }).ToList()
                            })
                            .ToList()
                    })
                    .ToList();

                return grouped;
            }
            catch
            {
                throw;
            }
        }
    }
}
