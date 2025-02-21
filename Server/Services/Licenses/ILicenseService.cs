using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId);
    public Task<License?> GetLicenseByUsernameWithDiscordAsync(string username);
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