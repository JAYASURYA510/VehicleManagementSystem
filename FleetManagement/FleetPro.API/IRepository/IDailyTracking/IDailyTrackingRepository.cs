using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository.IDailyTracking
{
    public interface IDailyTrackingRepository
    {
        Task<Guid> SaveDailyTrackingAsync(SaveDailyTrackingRequest request);
    }
}
