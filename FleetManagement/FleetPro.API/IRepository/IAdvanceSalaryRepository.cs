using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IAdvanceSalaryRepository
    {
        Task<List<AdvanceSalaryDto>> GetAllAdvanceSalariesAsync(Guid tenantId);
        Task<AdvanceSalaryDto?> GetAdvanceSalaryByIdAsync(Guid tenantId, Guid advanceId);
        Task<List<AdvanceSalaryDto>> GetAdvanceSalariesByUserIdAsync(Guid tenantId, int userId);
        Task<List<AdvanceSalaryDto>> GetAdvanceSalaryByAssignIdAsync(Guid tenantId, Guid assignedId);
        Task<List<AdvanceSalaryDto>> SearchAdvanceSalariesAsync(Guid tenantId, AdvanceSalarySearchDto request);
        Task<AdvanceSalaryDto?> SaveAdvanceSalaryAsync(Guid tenantId, CreateAdvanceSalaryDto request);
        Task<bool> UpdateAdvanceSalaryAsync(Guid tenantId, UpdateAdvanceSalaryDto request);
        Task<bool> DeleteAdvanceSalaryAsync(Guid tenantId, Guid advanceId);
    }
}
