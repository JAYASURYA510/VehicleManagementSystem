using FleetPro.API.DTOs;

namespace FleetPro.API.IRepository
{
    public interface ISettingRepository
    {
        /// <summary>
        /// Saves a new logo for the tenant.
        /// If a logo already exists for this tenant, it is soft-deleted first, then the new one is inserted.
        /// </summary>
        Task<SettingsResponseDto> SaveAsync(Guid tenantId, UploadLogoRequestDto request);

        /// <summary>
        /// Returns the active (non-deleted) logo record for the given tenant, or null if none exists.
        /// </summary>
        Task<SettingsResponseDto?> GetAsync(Guid tenantId);
    }
}

