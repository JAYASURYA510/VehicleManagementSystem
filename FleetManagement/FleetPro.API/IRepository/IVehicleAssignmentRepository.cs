using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IVehicleAssignmentRepository
    {
        Task<List<getVehicleAssignmentDto>> getAllAssignedVehicle();
        Task<List<VehicleAssignmentUserResponseDto>> getUserBasedVehicle();
        Task<VehicleUserAssignmentDto> saveAssignedVehicle(VehicleUserAssignmentDto vehicleUserAssignmentDto);
    }
}
