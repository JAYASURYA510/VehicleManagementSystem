using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface IVehicleMstRepository
    {
        Task<List<VehicleMstDto>> getAllVehicle();
        Task<VehicleMstDto> getVehicleById(Guid VehicleId);
        Task<VehicleMstDto> saveVehicle(VehicleMstDto vehicle);
        Task<VehicleMstDto> updateVehicle(Guid VehicleId, VehicleMstDto vehicle);
        Task<bool> deleteVehicle(Guid VehicleId);
        Task<List<VehicleMstDto>> getsearchedVehicle(searchVehicleDto searchVehicleDto);

    }
}
