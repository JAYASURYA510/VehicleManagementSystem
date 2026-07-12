
using FleetPro.API.IRepository;
using FleetPro.API.Repository;

namespace FleetPro.API.Data
{
    public static class RepositoryServiceExtensions
    {
        public static  IServiceCollection AddRepositoryServices(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IMenuRepository, MenuRepository>();

            return services;
        }
    }
}
