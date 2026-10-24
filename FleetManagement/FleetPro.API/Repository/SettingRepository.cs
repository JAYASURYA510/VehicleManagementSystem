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

                // 1. Hard-delete any existing logo for this tenant
                //    — remove the physical file first, then the DB row.
                var existingLogos = await context.ImageAttachments
                    .Where(x => x.TenantId == tenantId
                             && x.ImageType == "logo")
                    .ToListAsync();

                if (existingLogos.Any())
                {
                    foreach (var logo in existingLogos)
                    {
                        // Delete the physical file from wwwroot
                        var physicalPath = Path.Combine(env.WebRootPath, logo.FilePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                        if (File.Exists(physicalPath))
                            File.Delete(physicalPath);
                    }

                    // Remove all existing logo rows from the table
                    context.ImageAttachments.RemoveRange(existingLogos);
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
                    CreatedAt       = request.CreatedAt,
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

        /// <summary>
        /// Updates the existing logo record in-place (same Id).
        /// Deletes the old physical file, saves the new one, and updates
        /// FileName / FilePath / FileType / UpdatedAt / UpdatedBy on the same row.
        /// </summary>
        public async Task<SettingsResponseDto> UpdateAsync(Guid tenantId, UpdateSettingsResponseDto request)
        {
            try
            {
                var file = request.File;

                // 1. Fetch the existing logo row by Id + tenantId
                var existingLogo = await context.ImageAttachments
                    .Where(x => x.TenantId == tenantId
                             && x.Id == request.Id
                             && x.ImageType == "logo")
                    .FirstOrDefaultAsync();

                if (existingLogo == null)
                    throw new Exception($"No logo found with Id '{request.Id}' for this tenant.");

                // 2. Delete the old physical file from disk
                var oldPhysicalPath = Path.Combine(
                    env.WebRootPath,
                    existingLogo.FilePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

                if (File.Exists(oldPhysicalPath))
                    File.Delete(oldPhysicalPath);

                // 3. Save the new file to wwwroot/uploads/logos/
                var uploadsFolder = Path.Combine(env.WebRootPath, "uploads", "logos");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var newPhysicalPath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(newPhysicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var newRelativePath = Path.Combine("uploads", "logos", uniqueFileName)
                                         .Replace("\\", "/");

                // 4. Update the same DB row in-place (Id unchanged)
                existingLogo.FileName  = file.FileName;
                existingLogo.FilePath  = newRelativePath;
                existingLogo.FileType  = file.ContentType;
                existingLogo.UpdatedAt = DateTime.UtcNow;
                existingLogo.UpdatedBy = request.UpdatedBy;

                await context.SaveChangesAsync();

                return MapToSettingsResponseDto(existingLogo);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while updating the settings.", ex);
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

