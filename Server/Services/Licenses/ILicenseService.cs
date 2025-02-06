using Authentication.Models.Entities;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<List<License>> GetLicensesByDiscordId(long discordId);
    Task<License?> GetLicenseByIdAsync(long licenseId);
    Task<License?> GetLicenseByValueAsync(long license);
    Task<List<License>?> GetLicensesByHwidAsync(Hwid hwid);
    Task<License?> GetLicenseBySessionTokenAsync(string token);
    Task<License?> GetLicenseByCreationDateAsync(long license);
    Task<bool> ResetLicenseHwidAsync(long id);
    Task<bool> DeleteLicenseAsync(long id);
}