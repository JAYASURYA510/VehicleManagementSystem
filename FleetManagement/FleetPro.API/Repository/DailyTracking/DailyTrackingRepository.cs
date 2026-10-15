using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.IRepository.IImageAttachment;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository.DailyTracking
{
    public class DailyTrackingRepository : IDailyTrackingRepository
    {
        private readonly IDailyTrackingService dailyTrackingService;
        private readonly IImageAttachmentRepository imageRepository;
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly IWebHostEnvironment environment;
        public DailyTrackingRepository(ApplicationDbContext context, IMapper mapper, IDailyTrackingService dailyTrackingService, IImageAttachmentRepository imageRepository, IWebHostEnvironment environment)
        {
            this.context = context;
            this.mapper = mapper;
            this.dailyTrackingService = dailyTrackingService;
            this.imageRepository = imageRepository;
            this.environment = environment;
        }

        public async Task<Guid> SaveDailyTrackingAsync(Guid tenantId, SaveDailyTrackingRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var tracking = new DailyTrackingRecord
                {
                    Id = Guid.NewGuid(),
                    VehicleId = request.VehicleId,
                    TripDate = request.TripDate,
                    FromLocation = request.FromLocation,
                    ToLocation = request.ToLocation,
                    FuelStation = request.FuelStation,
                    DieselLitres = request.DieselLitres,
                    DieselCost = request.DieselCost,
                    FromKm = request.FromKm,
                    ToKm = request.ToKm,
                    KmBeforeFueling = request.KmBeforeFueling,
                    TollCharges = request.TollCharges ?? 0m,
                    WorkshopExpenses =request.WorkshopExpenses ?? 0m,
                    TyreMaintenance = request.TyreMaintenance ?? 0m,
                    DriverSalary = request.DriverSalary ?? 0m,
                    RtoCharges = request.RtoCharges ?? 0m,
                    TripRevenue = request.TripRevenue ?? 0m,
                    OtherExpenses = request.OtherExpenses ?? 0m,
                    Notes = request.Notes,
                    StatusType =  request.StatusType,
                    IsDelete = false,
                    CreatedAt = request.CreatedDate,
                    CreatedBy = request.CreatedBy,
                    TenantId = tenantId,
                };

                await dailyTrackingService.AddAsync(tracking);

                await AddImagesAsync(tenantId, tracking.Id, request);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return tracking.Id;
            
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving data.", ex);
            }
        }

        public async Task<bool> UpdateDailyTrackingAsync(Guid tenantId, Guid dailyTrackingId, SaveDailyTrackingRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var tracking = await context.DailyTrackingRecords.FirstOrDefaultAsync(x =>
                    x.Id == dailyTrackingId && x.TenantId == tenantId && x.IsDelete != true);

                if (tracking == null)
                {
                    return false;
                }

                tracking.VehicleId = request.VehicleId;
                tracking.TripDate = request.TripDate;
                tracking.FromLocation = request.FromLocation;
                tracking.ToLocation = request.ToLocation;
                tracking.FuelStation = request.FuelStation;
                tracking.DieselLitres = request.DieselLitres;
                tracking.DieselCost = request.DieselCost;
                tracking.FromKm = request.FromKm;
                tracking.ToKm = request.ToKm;
                tracking.KmBeforeFueling = request.KmBeforeFueling;
                tracking.TollCharges = request.TollCharges ?? 0m;
                tracking.WorkshopExpenses = request.WorkshopExpenses ?? 0m;
                tracking.TyreMaintenance = request.TyreMaintenance ?? 0m;
                tracking.DriverSalary = request.DriverSalary ?? 0m;
                tracking.RtoCharges = request.RtoCharges ?? 0m;
                tracking.TripRevenue = request.TripRevenue ?? 0m;
                tracking.OtherExpenses = request.OtherExpenses ?? 0m;
                tracking.Notes = request.Notes;
                tracking.StatusType = request.StatusType;
                tracking.UpdatedAt = DateTime.UtcNow;
                tracking.UpdatedBy = request.CreatedBy;

                await AddImagesAsync(tenantId, tracking.Id, request);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("An error occurred while updating data.", ex);
            }
        }

        public async Task<bool> DeleteDailyTrackingAsync(Guid tenantId, Guid dailyTrackingId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var tracking = await context.DailyTrackingRecords.FirstOrDefaultAsync(x =>
                    x.Id == dailyTrackingId && x.TenantId == tenantId && x.IsDelete != true);

                if (tracking == null)
                {
                    return false;
                }

                var imageRecords = await context.ImageAttachments
                    .Where(x => x.TenantId == tenantId && x.DailyTrackingId == dailyTrackingId)
                    .ToListAsync();

                context.ImageAttachments.RemoveRange(imageRecords);
                tracking.IsDelete = true;
                tracking.UpdatedAt = DateTime.UtcNow;
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                var folderPath = Path.Combine(
                    environment.WebRootPath,
                    "uploads",
                    "dailylog",
                    dailyTrackingId.ToString());

                if (Directory.Exists(folderPath))
                {
                    Directory.Delete(folderPath, recursive: true);
                }

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("An error occurred while deleting data.", ex);
            }
        }

        private async Task AddImagesAsync(Guid tenantId, Guid trackingId, SaveDailyTrackingRequest request)
        {
            if (request.Images == null || request.Images.Count == 0)
            {
                return;
            }

            var imageRecords = new List<ImageAttachment>();
            var folderPath = Path.Combine(
                environment.WebRootPath,
                "uploads",
                "dailylog",
                trackingId.ToString());

            Directory.CreateDirectory(folderPath);

            foreach (var image in request.Images)
            {
                if (image == null || image.Length == 0)
                {
                    continue;
                }

                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
                if (!allowedExtensions.Contains(extension))
                {
                    throw new Exception($"Invalid image format: {extension}");
                }

                var fileName = $"{Guid.NewGuid()}{extension}";
                var physicalPath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                imageRecords.Add(new ImageAttachment
                {
                    Id = Guid.NewGuid(),
                    DailyTrackingId = trackingId,
                    FileName = fileName,
                    FilePath = $"/uploads/dailylog/{trackingId}/{fileName}",
                    FileType = image.ContentType,
                    ImageType = "dailylog",
                    IsDelete = false,
                    CreatedAt = request.CreatedDate,
                    CreatedBy = request.CreatedBy,
                    TenantId = tenantId
                });
            }

            if (imageRecords.Count > 0)
            {
                await imageRepository.AddRangeAsync(imageRecords);
            }
        }

        public async Task<DailyTrackingDto?> GetDailyTrackingByIdAsync(Guid tenantId, Guid dailyTrackingId)
        {
            var tracking = await context.DailyTrackingRecords
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == dailyTrackingId &&
                    x.TenantId == tenantId &&
                    x.IsDelete != true);

            if (tracking == null)
            {
                return null;
            }

            var images = await context.ImageAttachments
                .AsNoTracking()
                .Where(x =>
                    x.TenantId == tenantId &&
                    x.DailyTrackingId == dailyTrackingId &&
                    !x.IsDelete)
                .ToListAsync();

            return new DailyTrackingDto
            {
                Id = tracking.Id,
                VehicleId = tracking.VehicleId,
                TripDate = tracking.TripDate,
                FromLocation = tracking.FromLocation,
                ToLocation = tracking.ToLocation,
                FuelStation = tracking.FuelStation,
                DieselLitres = tracking.DieselLitres ?? 0m,
                DieselCost = tracking.DieselCost ?? 0m,
                FromKm = tracking.FromKm,
                ToKm = tracking.ToKm,
                KmBeforeFueling = tracking.KmBeforeFueling,
                TollCharges = tracking.TollCharges ?? 0m,
                WorkshopExpenses = tracking.WorkshopExpenses ?? 0m,
                TyreMaintenance = tracking.TyreMaintenance ?? 0m,
                DriverSalary = tracking.DriverSalary ?? 0m,
                RtoCharges = tracking.RtoCharges ?? 0m,
                TripRevenue = tracking.TripRevenue ?? 0m,
                OtherExpenses = tracking.OtherExpenses ?? 0m,
                Notes = tracking.Notes,
                StatusType = tracking.StatusType,
                IsDelete = tracking.IsDelete ?? false,
                CreatedAt = tracking.CreatedAt,
                CreatedBy = tracking.CreatedBy,
                UpdatedAt = tracking.UpdatedAt,
                UpdatedBy = tracking.UpdatedBy,
                Images = images
            };
        }

        public async Task<List<DailyTrackingSearch>> getDailyTrackingAsync(Guid tenantId, int RoleId, int UserId)
        {
            try
            {
                var trakingResult = new List<DailyTrackingSearch>();
                if (RoleId == 1 || RoleId == 2)
                {
                    var trakingData = await context.DailyTrackingRecords.AsNoTracking().Where(
                            x => x.TenantId == tenantId && x.IsDelete != true).ToListAsync();

                        var result = (
                            from track in trakingData
                            join vehicle in context.VehicleMsts.AsNoTracking()
                              on track.VehicleId equals vehicle.VehicleId
                              select new DailyTrackingSearch
                              {
                                Id = track.Id,
                                TenantId = track.TenantId,
                                VehicleId = track.VehicleId,
                                RegistrationNumber = vehicle.RegistrationNumber,
                                TripDate = track.TripDate,
                                FromLocation = track.FromLocation,
                                ToLocation = track.ToLocation,
                                FuelStation = track.FuelStation,
                                DieselLitres = track.DieselLitres ?? 0m,
                                DieselCost = track.DieselCost,
                                FromKm = track.FromKm,
                                ToKm = track.ToKm,
                                KmBeforeFueling = track.KmBeforeFueling,
                                TollCharges = track.TollCharges,
                                WorkshopExpenses = track.WorkshopExpenses,
                                TyreMaintenance = track.TyreMaintenance,
                                DriverSalary = track.DriverSalary,
                                RtoCharges = track.RtoCharges,
                                TripRevenue = track.TripRevenue,
                                OtherExpenses = track.OtherExpenses,
                                Notes = track.Notes,
                                StatusType = track.StatusType
                              }
                        ).ToList();

                        if(result != null)
                        {
                            foreach (var item in result)
                            {
                                var data = new DailyTrackingSearch
                                {
                                    Id = item.Id,
                                    TenantId = item.TenantId,
                                    VehicleId = item.VehicleId,
                                    RegistrationNumber = item.RegistrationNumber,
                                    TripDate = item.TripDate,
                                    FromLocation = item.FromLocation,
                                    ToLocation = item.ToLocation,
                                    FuelStation = item.FuelStation,
                                    DieselLitres = item.DieselLitres,
                                    DieselCost = item.DieselCost,
                                    FromKm = item.FromKm,
                                    ToKm = item.ToKm,
                                    KmBeforeFueling = item.KmBeforeFueling,
                                    TollCharges = item.TollCharges,
                                    WorkshopExpenses = item.WorkshopExpenses,
                                    TyreMaintenance = item.TyreMaintenance,
                                    DriverSalary = item.DriverSalary,
                                    RtoCharges = item.RtoCharges,
                                    TripRevenue = item.TripRevenue,
                                    OtherExpenses = item.OtherExpenses,
                                    Notes = item.Notes,
                                    StatusType = item.StatusType
                                };
                                trakingResult.Add(data);
                            }
                            return trakingResult;
                        }
                        return trakingResult;
                }
                else
                {
                    var assignedVehicleIds = await context.VehicleUserAssignments
                        .Where(x => x.TenantId == tenantId && x.RoleId == RoleId && x.UserId == UserId && x.IsActive)
                        .Select(x => x.VehicleId)
                        .ToListAsync();

                    if (assignedVehicleIds.Any())
                    {
                        var trakingData = await context.DailyTrackingRecords.AsNoTracking().Where(
                            x => assignedVehicleIds.Contains(x.VehicleId) && x.TenantId == tenantId && x.CreatedBy == UserId && x.IsDelete != true).ToListAsync();

                        var result = (
                            from track in trakingData
                            join vehicle in context.VehicleMsts.AsNoTracking()
                              on track.VehicleId equals vehicle.VehicleId
                              select new DailyTrackingSearch
                              {
                                Id = track.Id,
                                TenantId = track.TenantId,
                                VehicleId = track.VehicleId,
                                RegistrationNumber = vehicle.RegistrationNumber,
                                TripDate = track.TripDate,
                                FromLocation = track.FromLocation,
                                ToLocation = track.ToLocation,
                                FuelStation = track.FuelStation,
                                DieselLitres = track.DieselLitres ?? 0m,
                                DieselCost = track.DieselCost,
                                FromKm = track.FromKm,
                                ToKm = track.ToKm,
                                KmBeforeFueling = track.KmBeforeFueling,
                                TollCharges = track.TollCharges,
                                WorkshopExpenses = track.WorkshopExpenses,
                                TyreMaintenance = track.TyreMaintenance,
                                DriverSalary = track.DriverSalary,
                                RtoCharges = track.RtoCharges,
                                TripRevenue = track.TripRevenue,
                                OtherExpenses = track.OtherExpenses,
                                Notes = track.Notes,
                                StatusType = track.StatusType
                              }
                        ).ToList();

                        if(result != null)
                        {
                            foreach (var item in result)
                            {
                                var data = new DailyTrackingSearch
                                {
                                    Id = item.Id,
                                    TenantId = item.TenantId,
                                    VehicleId = item.VehicleId,
                                    RegistrationNumber = item.RegistrationNumber,
                                    TripDate = item.TripDate,
                                    FromLocation = item.FromLocation,
                                    ToLocation = item.ToLocation,
                                    FuelStation = item.FuelStation,
                                    DieselLitres = item.DieselLitres,
                                    DieselCost = item.DieselCost,
                                    FromKm = item.FromKm,
                                    ToKm = item.ToKm,
                                    KmBeforeFueling = item.KmBeforeFueling,
                                    TollCharges = item.TollCharges,
                                    WorkshopExpenses = item.WorkshopExpenses,
                                    TyreMaintenance = item.TyreMaintenance,
                                    DriverSalary = item.DriverSalary,
                                    RtoCharges = item.RtoCharges,
                                    TripRevenue = item.TripRevenue,
                                    OtherExpenses = item.OtherExpenses,
                                    Notes = item.Notes,
                                    StatusType = item.StatusType
                                };
                                trakingResult.Add(data);
                            }
                            return trakingResult;
                        }
                         return trakingResult;
                    }
                }
                 return trakingResult;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving data.", ex);
            }
        }
    }
}
