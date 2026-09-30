using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository.IDailyTracking
{
    public interface IDailyTrackingRepository
    {
        Task<Guid> SaveDailyTrackingAsync(Guid tenantId, SaveDailyTrackingRequest request);
        Task<List<DailyTrackingSearch>> getDailyTrackingAsync(Guid tenantId, int RoleId, int UserId);
    }
}
