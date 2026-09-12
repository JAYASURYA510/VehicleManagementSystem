using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IVehicleAssignmentRepository
    {
        Task<List<getVehicleAssignmentDto>> getAllAssignedVehicle();
        Task<List<VehicleAssignmentUserResponseDto>> getUserBasedVehicle(int RoleId, int UserId);
        Task<List<vehicleDto>> getUserBasedVehicleDropDown(int RoleId, int UserId);
        Task<VehicleUserAssignmentDto> saveAssignedVehicle(VehicleUserAssignmentDto vehicleUserAssignmentDto);
        Task<bool> EditVehicleAssignmentAsync(EditVehicleAssignmentDto request);
        Task<bool> DeleteVehicleAssignmentAsync(Guid assignmentId);
        Task<List<VehicleAssignmentUserResponseDto>>SearchVehicleAssignmentsAsync(VehicleAssignmentSearchDto request);
        Task<VehicleAssignmentByIdDto> GetVehicleAssignmentByIdAsync(Guid assignmentId);
    }
}
