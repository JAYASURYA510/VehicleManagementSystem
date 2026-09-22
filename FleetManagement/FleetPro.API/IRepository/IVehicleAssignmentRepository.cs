using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IVehicleAssignmentRepository
    {
        Task<List<getVehicleAssignmentDto>> getAllAssignedVehicle(Guid tenantId);
        Task<List<VehicleAssignmentUserResponseDto>> getUserBasedVehicle(Guid tenantId, int RoleId, int UserId);
        Task<List<vehicleDto>> getUserBasedVehicleDropDown(Guid tenantId, int RoleId, int UserId);
        Task<VehicleUserAssignmentDto> saveAssignedVehicle(Guid tenantId, VehicleUserAssignmentDto vehicleUserAssignmentDto);
        Task<bool> EditVehicleAssignmentAsync(Guid tenantId, EditVehicleAssignmentDto request);
        Task<bool> DeleteVehicleAssignmentAsync(Guid tenantId, Guid assignmentId);
        Task<List<VehicleAssignmentUserResponseDto>>SearchVehicleAssignmentsAsync(Guid tenantId, VehicleAssignmentSearchDto request);
        Task<VehicleAssignmentByIdDto> GetVehicleAssignmentByIdAsync(Guid tenantId, Guid assignmentId);
    }
}
