using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository
{
    public class AdvanceSalaryRepository : IAdvanceSalaryRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public AdvanceSalaryRepository(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<List<AdvanceSalaryDto>> GetAllAdvanceSalariesAsync(Guid tenantId)
        {
            try
            {
                return await context.AdvanceSalaries
                    .Where(x => x.TenantId == tenantId && x.IsActive == true)
                    .OrderByDescending(x => x.CreatedDate)
                    .AsNoTracking()
                    .Select(x => new AdvanceSalaryDto
                    {
                        AdvanceId = x.AdvanceId,
                        AssignedId = x.AssignedId,
                        VehicleId = x.VehicleId,
                        VehicleNumber = x.Vehicle != null
                            ? x.Vehicle.RegistrationNumber
                            : (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null
                                ? x.VehicleUserAssignment.Vehicle.RegistrationNumber
                                : null),
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.fullName : null,
                        TenantId = x.TenantId,
                        AdvanceAmount = x.AdvanceAmount,
                        SalaryAmount = x.SalaryAmount,
                        IsActive = x.IsActive,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching advance salary records.", ex);
            }
        }

        public async Task<AdvanceSalaryDto?> GetAdvanceSalaryByIdAsync(Guid tenantId, Guid advanceId)
        {
            try
            {
                return await context.AdvanceSalaries
                    .Where(x => x.AdvanceId == advanceId && x.TenantId == tenantId && x.IsActive == true)
                    .AsNoTracking()
                    .Select(x => new AdvanceSalaryDto
                    {
                        AdvanceId = x.AdvanceId,
                        AssignedId = x.AssignedId,
                        VehicleId = x.VehicleId,
                        VehicleNumber = x.Vehicle != null
                            ? x.Vehicle.RegistrationNumber
                            : (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null
                                ? x.VehicleUserAssignment.Vehicle.RegistrationNumber
                                : null),
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.fullName : null,
                        TenantId = x.TenantId,
                        AdvanceAmount = x.AdvanceAmount,
                        SalaryAmount = x.SalaryAmount,
                        IsActive = x.IsActive,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate
                    })
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching the advance salary record.", ex);
            }
        }

        public async Task<List<AdvanceSalaryDto>> GetAdvanceSalariesByUserIdAsync(Guid tenantId, int userId)
        {
            try
            {
                return await context.AdvanceSalaries
                    .Where(x => x.TenantId == tenantId && x.UserId == userId && x.IsActive == true)
                    .OrderByDescending(x => x.CreatedDate)
                    .AsNoTracking()
                    .Select(x => new AdvanceSalaryDto
                    {
                        AdvanceId = x.AdvanceId,
                        AssignedId = x.AssignedId,
                        VehicleId = x.VehicleId,
                        VehicleNumber = x.Vehicle != null
                            ? x.Vehicle.RegistrationNumber
                            : (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null
                                ? x.VehicleUserAssignment.Vehicle.RegistrationNumber
                                : null),
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.fullName : null,
                        TenantId = x.TenantId,
                        AdvanceAmount = x.AdvanceAmount,
                        SalaryAmount = x.SalaryAmount,
                        IsActive = x.IsActive,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching user advance salary records.", ex);
            }
        }

        public async Task<List<AdvanceSalaryDto>> GetAdvanceSalaryByAssignIdAsync(Guid tenantId, Guid assignedId)
        {
            try
            {
                return await context.AdvanceSalaries
                    .Where(x => x.TenantId == tenantId && x.AssignedId == assignedId && x.IsActive == true)
                    .OrderByDescending(x => x.CreatedDate)
                    .AsNoTracking()
                    .Select(x => new AdvanceSalaryDto
                    {
                        AdvanceId = x.AdvanceId,
                        AssignedId = x.AssignedId,
                        VehicleId = x.VehicleId,
                        VehicleNumber = x.Vehicle != null
                            ? x.Vehicle.RegistrationNumber
                            : (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null
                                ? x.VehicleUserAssignment.Vehicle.RegistrationNumber
                                : null),
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.fullName : null,
                        TenantId = x.TenantId,
                        AdvanceAmount = x.AdvanceAmount,
                        SalaryAmount = x.SalaryAmount,
                        IsActive = x.IsActive,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching advance salary records by assign id.", ex);
            }
        }

        public async Task<List<AdvanceSalaryDto>> SearchAdvanceSalariesAsync(Guid tenantId, AdvanceSalarySearchDto request)
        {
            try
            {
                var query = context.AdvanceSalaries
                    .Where(x => x.TenantId == tenantId)
                    .AsNoTracking();

                if (request.AssignedId.HasValue && request.AssignedId != Guid.Empty)
                {
                    query = query.Where(x => x.AssignedId == request.AssignedId.Value);
                }

                if (request.VehicleId.HasValue && request.VehicleId != Guid.Empty)
                {
                    query = query.Where(x => x.VehicleId == request.VehicleId.Value);
                }

                if (request.UserId.HasValue && request.UserId > 0)
                {
                    query = query.Where(x => x.UserId == request.UserId.Value);
                }

                if (request.IsActive.HasValue)
                {
                    query = query.Where(x => x.IsActive == request.IsActive.Value);
                }

                if (request.FromDate.HasValue)
                {
                    query = query.Where(x => x.CreatedDate >= request.FromDate.Value);
                }

                if (request.ToDate.HasValue)
                {
                    query = query.Where(x => x.CreatedDate <= request.ToDate.Value);
                }

                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    var term = request.SearchTerm.Trim().ToLower();
                    query = query.Where(x =>
                        (x.User != null && x.User.fullName.ToLower().Contains(term)) ||
                        (x.Vehicle != null && x.Vehicle.RegistrationNumber.ToLower().Contains(term)) ||
                        (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null && x.VehicleUserAssignment.Vehicle.RegistrationNumber.ToLower().Contains(term)) ||
                        x.AdvanceAmount.Contains(term) ||
                        x.SalaryAmount.Contains(term));
                }

                return await query
                    .OrderByDescending(x => x.CreatedDate)
                    .Select(x => new AdvanceSalaryDto
                    {
                        AdvanceId = x.AdvanceId,
                        AssignedId = x.AssignedId,
                        VehicleId = x.VehicleId,
                        VehicleNumber = x.Vehicle != null
                            ? x.Vehicle.RegistrationNumber
                            : (x.VehicleUserAssignment != null && x.VehicleUserAssignment.Vehicle != null
                                ? x.VehicleUserAssignment.Vehicle.RegistrationNumber
                                : null),
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.fullName : null,
                        TenantId = x.TenantId,
                        AdvanceAmount = x.AdvanceAmount,
                        SalaryAmount = x.SalaryAmount,
                        IsActive = x.IsActive,
                        CreatedBy = x.CreatedBy,
                        CreatedDate = x.CreatedDate,
                        UpdatedBy = x.UpdatedBy,
                        UpdatedDate = x.UpdatedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while searching advance salary records.", ex);
            }
        }

        public async Task<AdvanceSalaryDto?> SaveAdvanceSalaryAsync(Guid tenantId, CreateAdvanceSalaryDto request)
        {
            try
            {
                var advanceSalary = new AdvanceSalaryMst
                {
                    AdvanceId = Guid.NewGuid(),
                    AssignedId = request.AssignedId,
                    VehicleId = request.VehicleId,
                    UserId = request.UserId,
                    TenantId = tenantId,
                    AdvanceAmount = request.AdvanceAmount,
                    SalaryAmount = request.SalaryAmount,
                    IsActive = request.IsActive,
                    CreatedBy = request.CreatedBy,
                    CreatedDate = request.CreatedDate?? DateTime.UtcNow
                };

                await context.AdvanceSalaries.AddAsync(advanceSalary);
                await context.SaveChangesAsync();

                return await GetAdvanceSalaryByIdAsync(tenantId, advanceSalary.AdvanceId);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving advance salary.", ex);
            }
        }

        public async Task<bool> UpdateAdvanceSalaryAsync(Guid tenantId, UpdateAdvanceSalaryDto request)
        {
            try
            {
                var existing = await context.AdvanceSalaries
                    .FirstOrDefaultAsync(x => x.AdvanceId == request.AdvanceId && x.TenantId == tenantId);

                if (existing == null)
                {
                    return false;
                }

                existing.AssignedId = request.AssignedId;
                existing.VehicleId = request.VehicleId;
                existing.UserId = request.UserId;
                existing.AdvanceAmount = request.AdvanceAmount;
                existing.SalaryAmount = request.SalaryAmount;
                existing.IsActive = request.IsActive;
                existing.UpdatedBy = request.UpdatedBy;
                existing.UpdatedDate = request.UpdatedDate ?? DateTime.UtcNow;

                await context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while updating advance salary.", ex);
            }
        }

        public async Task<bool> DeleteAdvanceSalaryAsync(Guid tenantId, Guid advanceId)
        {
            try
            {
                var existing = await context.AdvanceSalaries
                    .FirstOrDefaultAsync(x => x.AdvanceId == advanceId && x.TenantId == tenantId);

                if (existing == null)
                {
                    return false;
                }

                existing.IsActive = false;
                await context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while deleting advance salary.", ex);
            }
        }
    }
}
