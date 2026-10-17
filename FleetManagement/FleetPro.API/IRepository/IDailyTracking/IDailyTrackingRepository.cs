using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository.IDailyTracking
{
    public interface IDailyTrackingRepository
    {
        Task<Guid> SaveDailyTrackingAsync(Guid tenantId, SaveDailyTrackingRequest request);
        Task<bool> UpdateDailyTrackingAsync(Guid tenantId, Guid dailyTrackingId, SaveDailyTrackingRequest request);
        Task<bool> DeleteDailyTrackingAsync(Guid tenantId, Guid dailyTrackingId);
        Task<DailyTrackingDto?> GetDailyTrackingByIdAsync(Guid tenantId, Guid dailyTrackingId);
        Task<List<DailyTrackingSearch>> getDailyTrackingAsync(Guid tenantId, int RoleId, int UserId, DailyTrackingSearchRequest request);
    }
}
