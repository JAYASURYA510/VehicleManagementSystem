using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository;
using FleetPro.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Drawing;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FleetPro.API.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;

        public UserRepository(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;   
        }

        public async Task<List<userDatasDto>> getAllUser()
        {
            try
            {
                var userDatas = new List<userDatasDto>();
                var getUser = await context.UserMaster.ToListAsync();

                foreach (var item in getUser)
                {
                    var data = new userDatasDto
                    {
                        userId = item.userId,
                        username = item.username,
                        fullName = item.fullName,
                        emailId = item.emailId,
                        phoneNumber = item.phoneNumber,
                        role = item.role,
                        is_active = item.is_active
                    };
                    userDatas.Add(data);
                }

                return userDatas.ToList();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<UserDetailsDto> saveUser(UserDetailsDto user)
        {
            try
            {
                var username = user.username;
                var password = BCrypt.Net.BCrypt.HashPassword(user.password);

                var userData = await context.UserMaster
                    .Where(x => x.username == username && x.password == password)
                    .FirstOrDefaultAsync();

                if(userData != null)
                {
                   var message = "Username and password already exists";
                   Console.WriteLine(message);
                   return null;
                }

                var userEntity = mapper.Map<UserMst>(user);
                userEntity.userId = 0;
                userEntity.password = password;
                context.UserMaster.Add(userEntity);
                await context.SaveChangesAsync();
                return user;
            }
            catch (Exception ex)
            {
                throw new Exception("Exception", ex);
            }
        }

        public async Task<string> updateUser(UserDetailsDto user)
        {
            try
            {

                var userData = await context.UserMaster
                    .Where(x => x.userId == user.userId)
                    .FirstOrDefaultAsync();
             
               if(userData == null)
               {
                    return "User Not Found.";
               }
               else{
               userData.username = user.username;
               userData.fullName = user.fullName;
               userData.emailId = user.emailId;
               userData.phoneNumber = user.phoneNumber;
               userData.role = user.role;
               userData.is_active = user.is_active;
               userData.updatedBy = user.updatedBy;
               userData.updated_at = user.updated_at;

               await context.SaveChangesAsync();
                    return "User updated successfully.";
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Exception", ex);
            }
        }

        public async Task<string> deleteUser(int id)
        {
            try
            {
                var userData = await context.UserMaster.Where(x => x.userId == id).FirstOrDefaultAsync();
                if (userData == null) return "User Not Found";

                context.UserMaster.Remove(userData);
                await context.SaveChangesAsync();
                return "User Deleted Successfully";
            }
            catch (Exception ex)
            {
                 throw;
            }
        }
    }
}
