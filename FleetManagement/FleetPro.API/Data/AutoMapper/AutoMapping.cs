using AutoMapper;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;

namespace FleetPro.API.Data.AutoMapper
{
    public class AutoMapping : Profile
    {
        public AutoMapping() {
            CreateMap<UserDetailsDto, UserMst>().ReverseMap();
            CreateMap<MenuTypesDto, MenuMst>().ReverseMap();
        }
    }
}
