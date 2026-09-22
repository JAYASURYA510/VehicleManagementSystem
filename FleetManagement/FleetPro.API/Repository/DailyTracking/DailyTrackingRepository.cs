using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository.IDailyTracking;
using FleetPro.API.IRepository.IImageAttachment;

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

                await transaction.CommitAsync();
                return tracking.Id;
            
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving data.", ex);
            }
        }
    }
}
