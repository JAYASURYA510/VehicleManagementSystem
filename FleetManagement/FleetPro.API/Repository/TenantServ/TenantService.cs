using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.IRepository.ITenant;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository.TenantServ
{
    public class TenantService : ITenantService
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public TenantService(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<bool> CustomerIdExistsAsync(string customerId)
        {
            return await context.Tenants.AnyAsync(x =>x.CustomerId == customerId);
        }

        public async Task<bool> UserNameExistsAsync(string userName)
        {
            // IMPORTANT:
            // Username should be checked in user_mst,
            // because user_mst is your actual login table.

            return await context.UserMaster.AnyAsync(x =>x.username == userName);
        }

        public async Task<TenantMst> CreateTenantAsync(TenantMst tenant)
        {
            context.Tenants.Add(tenant);

            await context.SaveChangesAsync();

            return tenant;
        }

        public async Task<UserMst> CreateUserAsync(UserMst user)
        {
            context.UserMaster.Add(user);

            await context.SaveChangesAsync();

            return user;
        }
    }
}
