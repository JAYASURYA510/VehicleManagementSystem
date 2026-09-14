using FleetPro.API.Data.Entitys;

namespace FleetPro.API.IRepository.IDailyTracking
{
    public interface IDailyTrackingService
    {
        Task<DailyTrackingRecord> AddAsync(DailyTrackingRecord entity);
        // Task<DailyTrackingRecord?> GetByIdAsync(Guid id);
    }
}
