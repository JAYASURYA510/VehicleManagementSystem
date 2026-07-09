namespace FleetPro.API.Models;

public enum UserRole
{
    SuperAdmin = 0,
    Admin = 1,
    ManagingAuthority = 2,
    User = 3
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
