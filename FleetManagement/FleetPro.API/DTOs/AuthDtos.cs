using FleetPro.API.Models;

namespace FleetPro.API.DTOs;

public record LoginRequest(string Username, int roleId, string Password);

public record LoginResponse(
    string Token,
    int UserId,
    string Username,
    string FullName,
    string Email,
    UserRole Role,
    List<PermissionDto> Permissions,
    List<int> AssignedVehicleIds);

public record PermissionDto(
    AppModule Module,
    bool CanView,
    bool CanRead,
    bool CanWrite,
    bool CanEdit);

public record UserDto(
    int Id,
    string Username,
    string Email,
    string FullName,
    UserRole Role,
    bool IsActive,
    List<PermissionDto> Permissions,
    List<int> AssignedVehicleIds);

public record CreateUserRequest(
    string Username,
    string Email,
    string Password,
    string FullName,
    UserRole Role,
    List<PermissionDto> Permissions,
    List<int> AssignedVehicleIds);

public record UpdateUserRequest(
    string Email,
    string FullName,
    UserRole Role,
    bool IsActive,
    string? NewPassword,
    List<PermissionDto> Permissions,
    List<int> AssignedVehicleIds);

public record DashboardSummaryDto(
    int TotalVehicles,
    int ActiveVehicles,
    decimal TotalSpend,
    decimal TotalReturns,
    decimal NetProfit,
    decimal TotalDieselLitres,
    decimal AverageMileage,
    List<FinancialTrendPointDto> FinancialTrend,
    List<ProfitDistributionDto> ProfitDistribution);

public record FinancialTrendPointDto(string Label, decimal Spend, decimal Returns, decimal Profit);

public record ProfitDistributionDto(string Label, decimal Value);

public record VehicleSummaryDto(
    int VehicleId,
    string RegistrationNumber,
    string DriverName,
    decimal TotalDiesel,
    decimal TotalToll,
    decimal TotalWorkshop,
    decimal TotalInsurance,
    decimal TotalTyre,
    decimal TotalSalary,
    decimal TotalRTO,
    decimal TotalSpend,
    decimal TotalReturns,
    decimal NetProfit,
    decimal TotalDieselLitres,
    decimal AverageMileage);

public record DailyRecordRequest(
    int VehicleId,
    DateTime Date,
    string? FuelStation,
    decimal DieselLitres,
    decimal DieselCost,
    decimal FromKm,
    decimal ToKm,
    decimal KmBeforeFueling,
    decimal TollCharges,
    decimal InsuranceShare,
    decimal WorkshopExpenses,
    decimal TyreMaintenance,
    decimal DriverSalary,
    decimal RTOCharges,
    decimal TripRevenue,
    string? Notes);

public record DailyRecordListItemDto(
    int Id,
    int VehicleId,
    string RegistrationNumber,
    DateTime Date,
    decimal TotalSpend,
    decimal TripRevenue,
    decimal NetAmount,
    string? Notes);
