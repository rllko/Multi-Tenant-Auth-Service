using Authentication.Models.Entities;

namespace Authentication.Services.Hwids;

public class HwidService : IHwidService
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

    public async Task<List<License>> GetLicensesByHwid(string license)
    {
        throw new NotImplementedException();
    }
}