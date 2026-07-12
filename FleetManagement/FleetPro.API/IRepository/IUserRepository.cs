using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IUserRepository
    {
        Task<UserDetailsDto> saveUser(UserDetailsDto user);
        Task<List<userDatasDto>> getAllUser();
    }
}
