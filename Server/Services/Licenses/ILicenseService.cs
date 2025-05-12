using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId);
    Task<License?> GetLicenseByUsername(string username);
    Task<Option<IEnumerable<LicenseDto>>> GetLicenseByApplication(Guid application);

    Task<Result<LicenseDto, ValidationFailed>> ActivateLicense(Guid licenseValue, string username,
        string password, string email,
        long discordId,
        IDbTransaction? transaction = null);

    Task<License?> GetLicenseByIdAsync(long licenseId);
    Task<License?> GetLicenseByValueAsync(Guid license);
    Task<License?> GetLicenseByCreationDateAsync(DateTime license);
    Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null);
    Task<IEnumerable<License>> GetAllLicensesAsync();

    Task<Either<bool, ValidationFailed>> UpdateLicenseListAsync(
        IEnumerable<License> licenses,
        IDbTransaction? transaction = null);

    Task<License?> UpdateLicenseAsync(License license, IDbTransaction? transaction = null);
}