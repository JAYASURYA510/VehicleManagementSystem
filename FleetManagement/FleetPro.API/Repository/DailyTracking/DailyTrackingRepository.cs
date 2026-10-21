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
                    OpeningDieselLevel = request.OpeningDieselLevel,
                    ClosingDieselLevel = request.ClosingDieselLevel,
                    TotalDistanceTravelled = request.TotalDistanceTravelled,
                    TotalDieselConsumed = request.TotalDieselConsumed,
                    Mileage = request.Mileage,
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
                tracking.OpeningDieselLevel = request.OpeningDieselLevel;
                tracking.ClosingDieselLevel = request.ClosingDieselLevel;
                tracking.TotalDistanceTravelled = request.TotalDistanceTravelled;
                tracking.TotalDieselConsumed = request.TotalDieselConsumed;
                tracking.Mileage = request.Mileage;
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

                await UpdateImagesAsync(tenantId, tracking.Id, request);
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

                var rootPath = string.IsNullOrWhiteSpace(environment.WebRootPath)
                    ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                    : environment.WebRootPath;

                var folderPath = Path.Combine(
                    rootPath,
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

            var rootPath = string.IsNullOrWhiteSpace(environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : environment.WebRootPath;

            var folderPath = Path.Combine(
                rootPath,
                "uploads",
                "dailylog",
                trackingId.ToString());

            Directory.CreateDirectory(folderPath);

            var imageRecords = new List<ImageAttachment>();

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
                    CreatedAt = request.CreatedDate ?? DateTime.UtcNow,
                    CreatedBy = request.CreatedBy,
                    TenantId = tenantId
                });
            }

            if (imageRecords.Count > 0)
            {
                await imageRepository.AddRangeAsync(imageRecords);
            }
        }

        private async Task UpdateImagesAsync(Guid tenantId, Guid trackingId, SaveDailyTrackingRequest request)
        {
            var rootPath = string.IsNullOrWhiteSpace(environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : environment.WebRootPath;

            var folderPath = Path.Combine(
                rootPath,
                "uploads",
                "dailylog",
                trackingId.ToString());

            // 1. Fetch existing active image records from database for this tracking ID
            var existingImages = await context.ImageAttachments
                .Where(x => x.TenantId == tenantId && x.DailyTrackingId == trackingId && !x.IsDelete)
                .ToListAsync();

            var incomingFiles = request.Images?
                .Where(f => f != null)
                .ToList() ?? new List<IFormFile>();

            // Extract file names from payload (strip any client directory prefix)
            var incomingFileNames = incomingFiles
                .Select(f => Path.GetFileName(f.FileName))
                .Where(name => !string.IsNullOrEmpty(name))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            // 2. If an existing image in DB is NOT in incoming payload, delete from DB and physical folder
            var imagesToDelete = existingImages
                .Where(existing => !incomingFileNames.Contains(existing.FileName))
                .ToList();

            if (imagesToDelete.Count > 0)
            {
                foreach (var img in imagesToDelete)
                {
                    var fileNameOnly = Path.GetFileName(img.FileName);
                    var physicalPath = Path.Combine(folderPath, fileNameOnly);

                    if (File.Exists(physicalPath))
                    {
                        try
                        {
                            File.Delete(physicalPath);
                        }
                        catch
                        {
                            // Best effort physical file deletion
                        }
                    }
                    else if (!string.IsNullOrWhiteSpace(img.FilePath))
                    {
                        var altPath = Path.Combine(rootPath, img.FilePath.TrimStart('/', '\\'));
                        if (File.Exists(altPath))
                        {
                            try
                            {
                                File.Delete(altPath);
                            }
                            catch
                            {
                                // Best effort physical file deletion
                            }
                        }
                    }
                }

                context.ImageAttachments.RemoveRange(imagesToDelete);
            }

            // 3. Existing file names in database that are preserved
            var existingFileNames = existingImages
                .Select(e => e.FileName)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            // 4. Validate extensions for all new files first
            string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
            foreach (var image in incomingFiles)
            {
                var originalName = Path.GetFileName(image.FileName);
                if (string.IsNullOrEmpty(originalName) || existingFileNames.Contains(originalName))
                {
                    // Existing image - no need to validate or save again
                    continue;
                }

                var extension = Path.GetExtension(originalName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    throw new Exception($"Invalid image format: {extension}");
                }
            }

            // 5. Save any new incoming images (not already in existing images) to folder and DB
            var newImageRecords = new List<ImageAttachment>();
            var processedNames = new HashSet<string>(existingFileNames, StringComparer.OrdinalIgnoreCase);

            foreach (var image in incomingFiles)
            {
                var originalName = Path.GetFileName(image.FileName);
                if (string.IsNullOrEmpty(originalName))
                {
                    continue;
                }

                // If already in existing DB records or already processed in this batch, keep it and do not re-save
                if (!processedNames.Add(originalName))
                {
                    continue;
                }

                if (image.Length == 0)
                {
                    continue;
                }

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                var extension = Path.GetExtension(originalName).ToLowerInvariant();
                var newFileName = $"{Guid.NewGuid()}{extension}";
                var physicalPath = Path.Combine(folderPath, newFileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                newImageRecords.Add(new ImageAttachment
                {
                    Id = Guid.NewGuid(),
                    DailyTrackingId = trackingId,
                    FileName = newFileName,
                    FilePath = $"/uploads/dailylog/{trackingId}/{newFileName}",
                    FileType = image.ContentType,
                    ImageType = "dailylog",
                    IsDelete = false,
                    CreatedAt = request.CreatedDate ?? DateTime.UtcNow,
                    CreatedBy = request.CreatedBy,
                    TenantId = tenantId
                });
            }

            if (newImageRecords.Count > 0)
            {
                await imageRepository.AddRangeAsync(newImageRecords);
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
                OpeningDieselLevel = tracking.OpeningDieselLevel,
                ClosingDieselLevel = tracking.ClosingDieselLevel,
                TotalDistanceTravelled = tracking.TotalDistanceTravelled,
                TotalDieselConsumed = tracking.TotalDieselConsumed,
                Mileage = tracking.Mileage,
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

        public async Task<List<DailyTrackingSearch>> getDailyTrackingAsync(Guid tenantId, int RoleId, int UserId, DailyTrackingSearchRequest request)
        {
            try
            {
                var trakingResult = new List<DailyTrackingSearch>();
                if (RoleId == 1 || RoleId == 2)
                {
                    var trakingData = await context.DailyTrackingRecords.AsNoTracking().Where(
                            x => x.TenantId == tenantId && x.IsDelete != true).ToListAsync();

                    if (request.FromDate.HasValue && request.ToDate.HasValue)
                    {
                       trakingData = trakingData.Where(x => x.TripDate >= request.FromDate.Value && x.TripDate <= request.ToDate.Value).ToList();
                    }

                    if (request.registrationNumber != null)
                    {
                       trakingData = trakingData.Where(x => x.VehicleId == request.registrationNumber).ToList();
                    }

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
                                OpeningDieselLevel = track.OpeningDieselLevel,
                                ClosingDieselLevel = track.ClosingDieselLevel,
                                TotalDistanceTravelled = track.TotalDistanceTravelled,
                                TotalDieselConsumed = track.TotalDieselConsumed,
                                Mileage = track.Mileage,
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
                                    OpeningDieselLevel = item.OpeningDieselLevel,
                                    ClosingDieselLevel = item.ClosingDieselLevel,
                                    TotalDistanceTravelled = item.TotalDistanceTravelled,
                                    TotalDieselConsumed = item.TotalDieselConsumed,
                                    Mileage = item.Mileage,
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
                        
                        if (request.FromDate.HasValue && request.ToDate.HasValue)
                        {
                           trakingData = trakingData.Where(x => x.TripDate >= request.FromDate.Value && x.TripDate <= request.ToDate.Value).ToList();
                        }

                        if (request.registrationNumber != Guid.Empty)
                        {
                           trakingData = trakingData.Where(x => x.VehicleId == request.registrationNumber).ToList();
                        }

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
                                OpeningDieselLevel = track.OpeningDieselLevel,
                                ClosingDieselLevel = track.ClosingDieselLevel,
                                TotalDistanceTravelled = track.TotalDistanceTravelled,
                                TotalDieselConsumed = track.TotalDieselConsumed,
                                Mileage = track.Mileage,
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
                                    OpeningDieselLevel = item.OpeningDieselLevel,
                                    ClosingDieselLevel = item.ClosingDieselLevel,
                                    TotalDistanceTravelled = item.TotalDistanceTravelled,
                                    TotalDieselConsumed = item.TotalDieselConsumed,
                                    Mileage = item.Mileage,
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
