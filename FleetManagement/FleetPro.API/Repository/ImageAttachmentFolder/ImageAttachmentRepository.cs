using AutoMapper;
using FleetPro.API.Data.Entitys;
using FleetPro.API.Data;
using FleetPro.API.IRepository.IImageAttachment;

namespace FleetPro.API.Repository.ImageAttachmentFolder
{
    public class ImageAttachmentRepository : IImageAttachmentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        public ImageAttachmentRepository(ApplicationDbContext context, IMapper mapper)
            {
                this.context = context;
                this.mapper = mapper;
            }

            public async Task AddRangeAsync(List<ImageAttachment> images)
            {
                context.ImageAttachments.AddRange(images);

                await context.SaveChangesAsync();
            }
    }
    
}
