using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Repository
{
    public class SettingRepository : ISettingRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly IWebHostEnvironment env;

        public SettingRepository(ApplicationDbContext context, IMapper mapper, IWebHostEnvironment env)
        {
            this.context = context;
            this.mapper = mapper;
            this.env = env;
        }

        // ─── Save / Upsert Logo ──────────────────────────────────────────────────

        /// <summary>
        /// Saves the logo for the given tenant.
        /// Business rule: if a logo already exists for this tenant, soft-delete it,
        /// then insert a fresh record. daily_tracking_id is always null for logos.
        /// </summary>
        public async Task<SettingsResponseDto> SaveAsync(Guid tenantId, UploadLogoRequestDto request)
        {
            try
            {
                var file = request.File;

                // 1. Soft-delete any existing active logo for this tenant
                var existingLogos = await context.ImageAttachments
                    .Where(x => x.TenantId == tenantId
                             && x.ImageType == "logo"
                             && x.IsDelete == false)
                    .ToListAsync();

                if (existingLogos.Any())
                {
                    foreach (var logo in existingLogos)
                    {
                        logo.IsDelete = true;
                        logo.UpdatedAt = DateTime.UtcNow;
                        logo.UpdatedBy = request.CreatedBy;
                    }
                }

                // 2. Persist the new file to wwwroot/uploads/logos/
                var uploadsFolder = Path.Combine(env.WebRootPath, "uploads", "logos");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Relative path stored in DB (served via static files)
                var relativeFilePath = Path.Combine("uploads", "logos", uniqueFileName)
                                           .Replace("\\", "/");

                // 3. Insert the new logo record
                var newLogo = new ImageAttachment
                {
                    Id              = Guid.NewGuid(),
                    TenantId        = tenantId,
                    DailyTrackingId = null,
                    ImageType       = "logo",
                    FileName        = file.FileName,
                    FilePath        = relativeFilePath,
                    FileType        = file.ContentType,
                    IsDelete        = false,
                    CreatedAt       = DateTime.UtcNow,
                    CreatedBy       = request.CreatedBy
                };

                context.ImageAttachments.Add(newLogo);
                await context.SaveChangesAsync();

                return MapToSettingsResponseDto(newLogo);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while saving the settings.", ex);
            }
        }

        // ─── Get Settings ────────────────────────────────────────────────────────────

        /// <summary>
        /// Returns the active settings for the tenant, or null if none has been uploaded.
        /// </summary>
        public async Task<SettingsResponseDto?> GetAsync(Guid tenantId)
        {
            try
            {
                var logo = await context.ImageAttachments
                    .AsNoTracking()
                    .Where(x => x.TenantId == tenantId
                             && x.ImageType == "logo"
                             && x.IsDelete == false)
                    .OrderByDescending(x => x.CreatedAt)
                    .FirstOrDefaultAsync();

                return logo == null ? null : MapToSettingsResponseDto(logo);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving the logo.", ex);
            }
        }

        // ─── Private Helpers ─────────────────────────────────────────────────────

        private static SettingsResponseDto MapToSettingsResponseDto(ImageAttachment entity)
        {
            return new SettingsResponseDto
            {
                Id        = entity.Id,
                FileName  = entity.FileName,
                FilePath  = entity.FilePath,
                FileType  = entity.FileType,
                ImageType = entity.ImageType,
                TenantId  = entity.TenantId,
                CreatedAt = entity.CreatedAt,
                CreatedBy = entity.CreatedBy,
                UpdatedAt = entity.UpdatedAt,
                UpdatedBy = entity.UpdatedBy
            };
        }
    }
}

