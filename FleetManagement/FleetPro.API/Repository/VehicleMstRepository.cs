using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository
{
    public class VehicleMstRepository : IVehicleMstRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        public VehicleMstRepository(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<List<VehicleMstDto>> getAllVehicle()
        {
            try
            {
                var vehicleData = await context.VehicleMsts.AsNoTracking().ToListAsync();
                return mapper.Map<List<VehicleMstDto>>(vehicleData);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving vehicle details.", ex);
            }
        }

        public async Task<VehicleMstDto> getVehicleById(Guid VehicleId)
        {
            try
            {
                var vehicleData = await context.VehicleMsts.AsNoTracking().FirstOrDefaultAsync(v => v.VehicleId == VehicleId);
                if (vehicleData == null)
                {
                    throw new Exception($"Vehicle with ID {VehicleId} not found.");
                }
                return mapper.Map<VehicleMstDto>(vehicleData);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving vehicle details by ID.", ex);
            }
        }

        public async Task<VehicleMstDto> saveVehicle(VehicleMstDto vehicle)
        {
            try{
                
                var existingVehicle = await context.VehicleMsts.Where(x=> x.RegistrationNumber == vehicle.RegistrationNumber).AsNoTracking().FirstOrDefaultAsync();
                if (existingVehicle != null)
                {
                    throw new Exception("A vehicle with the same registration number already exists.");
                }

                var vehicleEntity = mapper.Map<VehicleMst>(vehicle);
                context.VehicleMsts.Add(vehicleEntity);
                await context.SaveChangesAsync();
                return mapper.Map<VehicleMstDto>(vehicleEntity);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving the vehicle details.", ex);
            }
        }

        public async Task<VehicleMstDto> updateVehicle(Guid VehicleId, VehicleMstDto vehicle)
        {
            try
            {
                var existingVehicle = await context.VehicleMsts.FindAsync(VehicleId);

                if (existingVehicle == null)
                {
                    throw new Exception($"Vehicle with ID {VehicleId} not found.");
                }

                // Update the properties of the existing vehicle entity
                existingVehicle.RegistrationNumber = vehicle.RegistrationNumber;
                existingVehicle.VehicleTypeId = vehicle.VehicleTypeId;
                existingVehicle.VehicleCategory = vehicle.VehicleCategory;
                existingVehicle.Make = vehicle.Make;
                existingVehicle.Model = vehicle.Model;
                existingVehicle.ChassisNumber = vehicle.ChassisNumber;
                existingVehicle.FuelTypeId = vehicle.FuelTypeId;
                existingVehicle.InsurancePolicyNo = vehicle.InsurancePolicyNo;
                existingVehicle.InsuranceExpiryDate = vehicle.InsuranceExpiryDate;
                existingVehicle.RcNumber = vehicle.RcNumber;
                existingVehicle.FcNumber = vehicle.FcNumber;
                existingVehicle.VehicleStatusId = vehicle.VehicleStatusId;
                existingVehicle.LastServiceDate = vehicle.LastServiceDate;
                existingVehicle.updatedDate = vehicle.updatedDate;
                existingVehicle.UpdatedBy = vehicle.UpdatedBy;

                await context.SaveChangesAsync();   
                return mapper.Map<VehicleMstDto>(existingVehicle);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while updating the vehicle details.", ex);
            }
        }

        public async Task<bool> deleteVehicle(Guid VehicleId)
        {
            try
            {
                var existingVehicle = await context.VehicleMsts.FindAsync(VehicleId);

                if (existingVehicle == null)
                {
                    throw new Exception($"Vehicle with ID {VehicleId} not found.");
                }

                context.VehicleMsts.Remove(existingVehicle);
                await context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while deleting the vehicle details.", ex);
            }
        }

        public async Task<List<VehicleMstDto>> getsearchedVehicle(searchVehicleDto searchVehicleDto)
        {
            try
            {
                var query = context.VehicleMsts.AsQueryable().AsNoTracking();
                if (!string.IsNullOrWhiteSpace(searchVehicleDto.RegistrationNumber))
                {
                    query = query.Where(x => x.RegistrationNumber.Contains(searchVehicleDto.RegistrationNumber));
                }
                if (searchVehicleDto.VehicleTypeId.HasValue)
                {
                    query = query.Where(x => x.VehicleTypeId == searchVehicleDto.VehicleTypeId);
                }
                if (searchVehicleDto.VehicleStatusId.HasValue)
                {
                    query = query.Where(x => x.VehicleStatusId == searchVehicleDto.VehicleStatusId);
                }
                if (!string.IsNullOrWhiteSpace(searchVehicleDto.searchTerm))
                {
                    query = query.Where(x => x.ChassisNumber.Contains(searchVehicleDto.searchTerm) || x.RcNumber.Contains(searchVehicleDto.searchTerm) || x.FcNumber.Contains(searchVehicleDto.searchTerm));
                }

                var result = await query.ToListAsync();
                return mapper.Map<List<VehicleMstDto>>(result);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while searching vehicle details.", ex);
            }
        }
    }
}
