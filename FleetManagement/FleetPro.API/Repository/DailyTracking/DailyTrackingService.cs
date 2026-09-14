using Microsoft.EntityFrameworkCore;
using System.Linq;
using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.IRepository.IDailyTracking;

namespace FleetPro.API.Repository.DailyTracking
{
    public class DailyTrackingService : IDailyTrackingService
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public DailyTrackingService(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public async Task<DailyTrackingRecord> AddAsync(DailyTrackingRecord entity)
        {
            context.DailyTrackingRecords.Add(entity);

            //await context.SaveChangesAsync();

            return entity;
        }

    //    public async Task<DailyTrackingRecord?> GetByIdAsync(Guid id)
    //    {
    //         return await context.DailyTrackingRecords
    //         .Include(x => x.Images)
    //         .FirstOrDefaultAsync(x =>
    //             x.Id == id &&
    //             x.IsDelete == false);
    //    }
    }
}
