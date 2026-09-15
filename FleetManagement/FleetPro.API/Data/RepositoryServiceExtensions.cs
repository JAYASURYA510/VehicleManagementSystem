
using FleetPro.API.IRepository;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.IRepository.IImageAttachment;
using FleetPro.API.IRepository.ITenant;
using FleetPro.API.Repository;
using FleetPro.API.Repository.DailyTracking;
using FleetPro.API.Repository.ImageAttachmentFolder;
using FleetPro.API.Repository.TenantServ;

namespace FleetPro.API.Data
{
    public static class RepositoryServiceExtensions
    {
        public static  IServiceCollection AddRepositoryServices(this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IMenuRepository, MenuRepository>();
            services.AddScoped<IVehicleMstRepository, VehicleMstRepository>();
            services.AddScoped<IVehicleAssignmentRepository, VehicleAssignmentRepository>();
            services.AddScoped<IDailyTrackingService, DailyTrackingService>();
            services.AddScoped<IDailyTrackingRepository, DailyTrackingRepository>();
            services.AddScoped<IImageAttachmentRepository, ImageAttachmentRepository>();
            services.AddScoped<ITenantService, TenantService>();
            services.AddScoped<ITenantServiceRepository, TenantRepository>();
            services.AddScoped<IPasswordService, PasswordService>();
            return services;
        }
    }
}
