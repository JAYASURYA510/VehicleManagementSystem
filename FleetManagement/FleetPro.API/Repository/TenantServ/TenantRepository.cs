using AutoMapper;
using FleetPro.API.Data;
using FleetPro.API.Data.Entitys;
using FleetPro.API.DTOs;
using FleetPro.API.IRepository.ITenant;
using FleetPro.API.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace FleetPro.API.Repository.TenantServ
{
    public class TenantRepository : ITenantServiceRepository
    {
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private readonly ITenantService _tenantService;
        private readonly IPasswordService _passwordService;

        public TenantRepository(ApplicationDbContext context, IMapper mapper, ITenantService _tenantService, IPasswordService _passwordService)
        {
            this.context = context;
            this.mapper = mapper;
            this._tenantService = _tenantService;
            this._passwordService = _passwordService;
        }

        public async Task<List<AdminListResponse>> getSuperAdminAsyc()
        {
            try
            {
                var getData = await context.Tenants.Where(x => x.IsSuperAdmin == "yes").AsNoTracking().ToListAsync();

                var adminListResponses = new List<AdminListResponse>();
                foreach (var data in getData)
                {
                    adminListResponses.Add(new AdminListResponse
                    {
                        TenantId = data.TenantId,
                        CustomerId = data.CustomerId,
                        CustomerName = data.CustomerName,
                        UserName = data.UserName,
                        EmailId = data.EmailId,
                        PhoneNo = data.PhoneNo,
                        Address = data.Address,
                        GstNo = data.GstNo,
                        TanNo = data.TanNo,
                        IsSuperAdmin = data.IsSuperAdmin,
                    });
                }

                return adminListResponses;

            }
            catch (Exception ex) {
                throw new Exception("facing error while creating the customer");
            }
        }

        public async Task<(bool Success, string Message, object? Data)> OnboardClientAsync(OnboardClientRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                if (request == null)
                {
                    return (
                        false,
                        "Request is required.",
                        null
                    );
                }

                var customerId = request.CustomerId.Trim();

                var customerName = request.CustomerName;

                var userName = request.UserName.Trim();

                var customerExists = await _tenantService.CustomerIdExistsAsync(customerId);
                var createPassword = _passwordService.HashPassword(request.Password);

                if (customerExists)
                {
                    return (
                        false,
                        "Customer ID already exists.",
                        null
                    );
                }

                var userNameExists = await _tenantService.UserNameExistsAsync(userName);

                if (userNameExists)
                {
                    return (
                        false,
                        "Username already exists.",
                        null
                    );
                }

                var tenant = new TenantMst
                {
                    CustomerId = customerId,
                    UserName = userName,
                    Password = createPassword,
                    CustomerName = customerName,
                    EmailId = request.EmailId,
                    PhoneNo = request.PhoneNo,
                    Address = request.Address,
                    GstNo = request.GstNo,
                    TanNo = request.TanNo,
                    IsSuperAdmin = request.IsSuperAdmin,
                    IsActive = true,
                    CreatedDate = request.CreatedDate,
                    CreatedBy = request.CreatedBy,
                    UpdatedBy = request.UpdatedBy,
                    UpdatedDate = request.UpdatedDate,
                };
                // Insert Tenant
                await _tenantService.CreateTenantAsync(tenant);

                var adminUser = new UserMst
                {
                    username = userName,
                    password = createPassword,
                    fullName = request.CustomerName,
                    emailId = request.EmailId,
                    phoneNumber = request.PhoneNo,
                    role = request.IsSuperAdmin == "no" ? 2 : 1,
                    is_active = true,
                    TenantId = tenant.TenantId,
                    createdBy = request.CreatedBy,
                    created_at = request.CreatedDate,
                    updatedBy = request.UpdatedBy,
                    updated_at = request.UpdatedDate
                };
                //Insert Admin User
                await _tenantService.CreateUserAsync(adminUser);
                await transaction.CommitAsync();

                var responseData = new
                {
                    tenantId = tenant.TenantId,
                    customerId = tenant.CustomerId,
                    customerName = tenant.CustomerName,
                    adminUserId = adminUser.userId,
                    adminUserName = adminUser.username,
                    roleId = adminUser.role
                };

                return (
                    true,
                    "Client and Admin account created successfully.",
                    responseData
                );

            }
            catch (Exception ex) {
                throw new Exception("facing error while creating the customer");
            }
        }
    }
}
