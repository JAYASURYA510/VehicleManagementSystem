using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository
{
    public class VehicleAssignmentRepository : IVehicleAssignmentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        public VehicleAssignmentRepository(ApplicationDbContext context, IMapper mapper)
        {
             this.context = context;
            this.mapper = mapper;
        }

        public async Task<List<getVehicleAssignmentDto>> getAllAssignedVehicle()
        {
            try
            {
                var allData = new List<getVehicleAssignmentDto>();
                var getAllAssignedData = await context.VehicleUserAssignments.AsNoTracking().ToListAsync();

                if (!getAllAssignedData.Any())
                {
                    throw new ArgumentException("No Data Found");
                }

                foreach (var data in getAllAssignedData)
                {
                    allData.Add(new getVehicleAssignmentDto
                    {
                        VehicleId = data.VehicleId,
                        UserId = data.UserId,
                        RoleId = data.RoleId,
                        FromDate = data.FromDate,
                        ToDate = data.ToDate,
                        IsActive = data.IsActive,
                        created_date = data.created_date,
                        CreatedBy = data.CreatedBy,
                        updatedDate = data.updatedDate,
                        UpdatedBy = data.UpdatedBy
                    });
                }

                return allData;
            }
            catch (Exception ex)
            {
               throw new Exception("An error occurred while saving data.", ex);
            }
        }

        public async Task<List<VehicleAssignmentUserResponseDto>> getUserBasedVehicle()
        {
            try
            {
                var assignments = await context.VehicleUserAssignments
            .Select(x => new
            {
                x.AssignmentId,
                x.UserId,
                x.RoleId,
                x.VehicleId,
                x.FromDate,
                x.ToDate,
                x.IsActive,

                UserName = x.User.fullName,
                RoleName = x.Role.roleName,
                VehicleNumber = x.Vehicle.RegistrationNumber
            })
            .ToListAsync();

                var result = assignments
                    .GroupBy(x => new
                    {
                        x.UserId,
                        x.RoleId,
                        x.UserName,
                        x.RoleName
                    })
                    .Select(g => new VehicleAssignmentUserResponseDto
                    {
                        UserId = g.Key.UserId,
                        UserName = g.Key.UserName,
                        RoleId = g.Key.RoleId,
                        RoleName = g.Key.RoleName,

                        Assignments = g.Select(x => new VehicleAssignmentDetailDto
                        {
                            AssignmentId = x.AssignmentId,
                            VehicleId = x.VehicleId,
                            VehicleNumber = x.VehicleNumber,
                            FromDate = x.FromDate,
                            ToDate = x.ToDate,
                            IsActive = x.IsActive
                        }).ToList()
                    })
                    .ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving data.", ex);
            }
        }

        public async Task<VehicleUserAssignmentDto> saveAssignedVehicle(VehicleUserAssignmentDto vehicleUserAssignmentDto)
        {
            try
            {
                // Remove empty and duplicate VehicleIds
                var vehicleIds = vehicleUserAssignmentDto.VehicleId.Where(x => x != Guid.Empty).Distinct().ToList();

                if (!vehicleIds.Any())
                {
                   throw new ArgumentException("Invalid vehicle list.", nameof(vehicleUserAssignmentDto));
                }

                var existingAssignments = await context.VehicleUserAssignments.Where(x => x.FromDate == vehicleUserAssignmentDto.FromDate && x.ToDate == vehicleUserAssignmentDto.ToDate && vehicleIds.Contains(x.VehicleId)
                                           && x.RoleId == vehicleUserAssignmentDto.RoleId && x.IsActive == true).AsNoTracking().ToListAsync();

                // Close old assignment if the vehicle is assigned
                // to another user with the same role
                foreach (var existing in existingAssignments)
                {
                    if (existing.UserId != vehicleUserAssignmentDto.UserId)
                    {
                        existing.IsActive = false;
                        existing.ToDate = vehicleUserAssignmentDto.FromDate;
                        existing.UpdatedBy = vehicleUserAssignmentDto.UpdatedBy;
                        existing.updatedDate = DateTime.UtcNow;
                    }
                }

                // Vehicles already assigned to the same user
                var alreadyAssignedVehicleIds  = await context.VehicleUserAssignments.Where(x => x.FromDate == vehicleUserAssignmentDto.FromDate && x.ToDate == vehicleUserAssignmentDto.ToDate && vehicleIds.Contains(x.VehicleId)
                                           && x.UserId == vehicleUserAssignmentDto.UserId && x.IsActive == true).AsNoTracking().ToListAsync();

                // Get only new vehicles
                var alreadyAssignedIds = alreadyAssignedVehicleIds.Select(x => x.VehicleId);
                var newVehicleIds = vehicleIds.Except(alreadyAssignedIds).ToList();

                var assignments = newVehicleIds.Select(vehicleId =>
                new VehicleUserAssignment
                {
                   AssignmentId = Guid.NewGuid(),
                   VehicleId = vehicleId,
                   UserId = vehicleUserAssignmentDto.UserId,
                   RoleId = vehicleUserAssignmentDto.RoleId,
                   FromDate = vehicleUserAssignmentDto.FromDate,
                   ToDate = vehicleUserAssignmentDto.ToDate,
                   IsActive = vehicleUserAssignmentDto.IsActive,
                   created_date = vehicleUserAssignmentDto.created_date,
                   CreatedBy = vehicleUserAssignmentDto.CreatedBy,
                   updatedDate = vehicleUserAssignmentDto.updatedDate,
                   UpdatedBy = vehicleUserAssignmentDto.UpdatedBy
                }).ToList();

                if (assignments.Any())
                {
                   context.VehicleUserAssignments.AddRange(assignments);
                }
                await context.SaveChangesAsync();

                return vehicleUserAssignmentDto;
            }
            catch (Exception ex)
            {
               throw new Exception("An error occurred while saving data.", ex);
            }
        }
    }
}
