using System.Data;
using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId);
    Task<License?> GetLicenseByIdAsync(long licenseId);
    Task<License?> GetLicenseByValueAsync(long license);
    Task<License?> GetLicenseByCreationDateAsync(DateTime license);
    Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null);
    Task<IEnumerable<License>> GetAllLicensesAsync();

    Task<Either<bool, ValidationFailed>> UpdateLicenseListAsync(
        IEnumerable<License> licenses,
        IDbTransaction? transaction = null);

    Task<Either<License, ValidationFailed>> UpdateLicenseAsync(License license, IDbTransaction? transaction = null);
}