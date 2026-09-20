using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IUserRepository
    {
        Task<UserDetailsDto> saveUser(Guid tenantId, UserDetailsDto user);
        Task<List<userDatasDto>> getAllUser(Guid tenantId);
        Task<string> updateUser(Guid tenantId, UserDetailsDto user);
        Task<string> deleteUser(Guid tenantId, int id);
    }
}
