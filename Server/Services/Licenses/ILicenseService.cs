using Authentication.Models.Entities;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<List<License>> GetLicensesByDiscordId(long discordId);
    Task<License?> GetLicenseByIdAsync(long licenseId);
    Task<License?> GetLicenseByValueAsync(long license);
    Task<Models.Entities.SessionToken> GetSessionByLicenseAsync(License license);
    Task<License?> GetLicenseByCreationDateAsync(DateTime license);
    Task<bool> ResetLicenseHwidAsync(long id);
    Task<bool> DeleteLicenseAsync(long id);
}