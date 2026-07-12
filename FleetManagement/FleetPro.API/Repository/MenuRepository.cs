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
    }
}
