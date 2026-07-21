using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IMenuRepository
    {
        Task<List<RoleDto>> getrole();
        Task<List<MenuTypesDto>> getMenuTypes();
        Task<List<MenuDto>> getNavMenu(int roleId);
    }
}
