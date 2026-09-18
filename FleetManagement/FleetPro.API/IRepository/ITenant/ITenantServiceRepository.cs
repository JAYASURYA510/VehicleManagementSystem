using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository.ITenant
{
    public interface ITenantServiceRepository
    {
        Task<List<AdminListResponse>> getSuperAdminAsyc();
        Task<List<AdminListResponse>> getAdminDetailsAsyc();
        Task<(bool Success, string Message, object? Data)>OnboardClientAsync(OnboardClientRequest request);
    }
}
