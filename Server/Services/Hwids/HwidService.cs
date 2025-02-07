using Authentication.Database;
using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Services.Hwids;

public class HwidService(IValidator<Hwid> validator, IDbConnectionFactory connectionFactory) : IHwidService
{
    public async Task<Hwid> GetHwidByIdAsync(long licenseId)
    {
        throw new NotImplementedException();
    }

    public async Task<Hwid> GetHwidBySessionTokenAsync(string token)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> AssignLicenseHwidAsync(string license, Hwid hwid)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseHwidAsync(string license)
    {
        throw new NotImplementedException();
    }

    public Task<List<License>?> GetLicensesByHwidAsync(Hwid hwid)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>> GetLicensesByHwid(string license)
    {
        throw new NotImplementedException();
    }
}