using Authentication.Models.Entities;

namespace Authentication.Services.Hwids;

public interface IHwidService
{
    Task<Hwid> GetHwidByIdAsync(long licenseId);
    Task<Hwid> GetHwidBySessionTokenAsync(string token);
    Task<bool> AssignLicenseHwidAsync(string license, Hwid hwid);
    Task<bool> DeleteLicenseHwidAsync(string license);
    Task<List<License>> GetLicensesByHwid(string license);
}