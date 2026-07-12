using System.ComponentModel;

namespace FleetPro.API.Models;

public enum UserRole
{
    [Description("Super Admin")]
    SuperAdmin = 1,
    [Description("Admin")]
    Admin = 2,
    [Description("Manager")]
    ManagingAuthority = 3,
    [Description("Driver")]
    User = 4
}

public enum AppModule
{
    Dashboard,
    Vehicles,
    Diesel,
    Toll,
    Trip,
    Insurance,
    Workshop,
    Tyre,
    Salary,
    RTO,
    Profit,
    Masters,
    Users
}

public enum ProfitType
{
    Spend = 0,
    Return = 1
}
