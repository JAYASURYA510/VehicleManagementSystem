namespace FleetPro.API.IRepository.ITenant
{
    public interface IPasswordService
    {
        string HashPassword(string password);

        bool VerifyPassword(string password, string passwordHash);
    }
}
