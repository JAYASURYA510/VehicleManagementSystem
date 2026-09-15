using FleetPro.API.Data.Entitys;
using FleetPro.API.Models;

namespace FleetPro.API.IRepository.ITenant
{
    public interface ITenantService
    {
        Task<bool> CustomerIdExistsAsync(string customerId);

        Task<bool> UserNameExistsAsync(string userName);

        Task<TenantMst> CreateTenantAsync(TenantMst tenant);

        Task<UserMst> CreateUserAsync(UserMst user);
    }
}
