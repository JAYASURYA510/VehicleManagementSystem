using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IVehicleMstRepository
    {
        Task<List<VehicleMstDto>> getAllVehicle(Guid tenantId);
        Task<VehicleMstDto> getVehicleById(Guid tenantId, Guid VehicleId);
        Task<VehicleMstDto> saveVehicle(Guid tenantId, VehicleMstDto vehicle);
        Task<VehicleMstDto> updateVehicle(Guid tenantId, Guid VehicleId, VehicleMstDto vehicle);
        Task<bool> deleteVehicle(Guid tenantId, Guid VehicleId);
        Task<List<VehicleMstDto>> getsearchedVehicle(Guid tenantId, searchVehicleDto searchVehicleDto);

    }
}
