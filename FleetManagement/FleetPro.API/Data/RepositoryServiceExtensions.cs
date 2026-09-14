
using FleetPro.API.IRepository;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.IRepository.IImageAttachment;
using FleetPro.API.Repository;
using FleetPro.API.Repository.DailyTracking;
using FleetPro.API.Repository.ImageAttachmentFolder;

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

            return services;
        }
    }
}
