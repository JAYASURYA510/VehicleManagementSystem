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

                if (request.Images != null && request.Images.Count > 0)
                {
                    var imageRecords = new List<ImageAttachment>();

                    // Folder:
                    // wwwroot/uploads/dailylog/{trackingId}

                    string folderPath =
                    Path.Combine(
                        environment.WebRootPath,
                        "uploads",
                        "dailylog",
                        tracking.Id.ToString());

                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    foreach (var image in request.Images)
                    {
                        if (image == null || image.Length == 0)
                        {
                          continue;
                        }

                        string extension = Path.GetExtension(image.FileName).ToLowerInvariant();

                        string[] allowedExtensions ={".jpg",".jpeg",".png",".webp"};

                        if (!allowedExtensions.Contains(extension))
                        {
                            throw new Exception($"Invalid image format: {extension}");
                        }

                        // Generate unique name 
                        string fileName =$"{Guid.NewGuid()}{extension}";
                        // Physical path
                        string physicalPath =Path.Combine(folderPath,fileName);

                        // Save image
                        using (var stream = new FileStream(physicalPath,FileMode.Create))
                                            {
                                                await image.CopyToAsync(stream);
                                            }

                        // DB path
                        string filePath =$"/uploads/dailylog/" +$"{tracking.Id}/{fileName}";

                        // Create DB record
                        var imageRecord =
                        new ImageAttachment
                        {
                            Id = Guid.NewGuid(),
                            DailyTrackingId = tracking.Id,
                            FileName = fileName,                              
                            FilePath =  filePath,                            
                            FileType = image.ContentType,                           
                            ImageType = "dailylog",                         
                            IsDelete = false,
                            CreatedAt = request.CreatedDate,       
                            CreatedBy = request.CreatedBy,
                            TenantId = tenantId,
                        };

                        imageRecords.Add(imageRecord);

                    }

                    if (imageRecords.Count > 0)
                    {
                       await imageRepository.AddRangeAsync(imageRecords);
                    }
                }
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return tracking.Id;
            
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving data.", ex);
            }
        }

        public async Task<List<DailyTrackingSearch>> getDailyTrackingAsync(Guid tenantId, int RoleId, int UserId)
        {
            try
            {
                var trakingResult = new List<DailyTrackingSearch>();
                if (RoleId == 1 || RoleId == 2)
                {
                    var trakingData = await context.DailyTrackingRecords.AsNoTracking().Where(
                            x => x.TenantId == tenantId).ToListAsync();

                        var result = (
                            from track in trakingData
                            join vehicle in context.VehicleMsts.AsNoTracking()
                              on track.VehicleId equals vehicle.VehicleId
                              select new DailyTrackingSearch
                              {
                                TenantId = track.TenantId,
                                VehicleId = track.VehicleId,
                                RegistrationNumber = vehicle.RegistrationNumber,
                                TripDate = track.TripDate,
                                FromLocation = track.FromLocation,
                                ToLocation = track.ToLocation,
                                FuelStation = track.FuelStation,
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
                                    TenantId = item.TenantId,
                                    VehicleId = item.VehicleId,
                                    RegistrationNumber = item.RegistrationNumber,
                                    TripDate = item.TripDate,
                                    FromLocation = item.FromLocation,
                                    ToLocation = item.ToLocation,
                                    FuelStation = item.FuelStation,
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
                            x => assignedVehicleIds.Contains(x.VehicleId) && x.TenantId == tenantId && x.CreatedBy == UserId).ToListAsync();

                        var result = (
                            from track in trakingData
                            join vehicle in context.VehicleMsts.AsNoTracking()
                              on track.VehicleId equals vehicle.VehicleId
                              select new DailyTrackingSearch
                              {
                                TenantId = track.TenantId,
                                VehicleId = track.VehicleId,
                                RegistrationNumber = vehicle.RegistrationNumber,
                                TripDate = track.TripDate,
                                FromLocation = track.FromLocation,
                                ToLocation = track.ToLocation,
                                FuelStation = track.FuelStation,
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
                                    TenantId = item.TenantId,
                                    VehicleId = item.VehicleId,
                                    RegistrationNumber = item.RegistrationNumber,
                                    TripDate = item.TripDate,
                                    FromLocation = item.FromLocation,
                                    ToLocation = item.ToLocation,
                                    FuelStation = item.FuelStation,
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
