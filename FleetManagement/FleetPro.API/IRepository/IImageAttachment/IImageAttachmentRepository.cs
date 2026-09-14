using FleetPro.API.Data.Entitys;

namespace FleetPro.API.IRepository.IImageAttachment
{
    public interface IImageAttachmentRepository
    {
        Task AddRangeAsync(List<ImageAttachment> images);
    }
}
