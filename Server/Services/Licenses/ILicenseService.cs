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

    Task<License?> GetLicenseByIdAsync(long licenseId, IDbTransaction? transaction = null);
    Task<License?> GetLicenseByValueAsync(Guid license, IDbTransaction? transaction = null);
    Task<License?> GetLicenseByCreationDateAsync(DateTime license);
    Task<License?> GetLicenseForAppAsync(long licenseId, Guid appId, IDbTransaction? transaction = null);
    Task<License?> ExtendLicenseForAppAsync(long licenseId, Guid appId, int amount, string unit, IDbTransaction? transaction = null);
    Task<License?> SetLicenseBannedAsync(long licenseId, Guid appId, bool banned, IDbTransaction? transaction = null);
    Task<License?> SetLicenseRevokedAsync(long licenseId, Guid appId, long revokedAt, IDbTransaction? transaction = null);
    Task<int> DeleteLicensesForAppAsync(IEnumerable<long> licenseIds, Guid appId, IDbTransaction? transaction = null);
    Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null);
    Task<IEnumerable<License>> GetAllLicensesAsync();

    Task<Either<bool, ValidationFailed>> UpdateLicenseListAsync(
        IEnumerable<License> licenses,
        IDbTransaction? transaction = null);

    Task<License?> UpdateLicenseAsync(License license, IDbTransaction? transaction = null);

    Task<LicenseStats> GetLicenseStatsByTeamAsync(Guid teamId);
    Task<IEnumerable<LicensesPerDay>> GetLicensesPerDayByTeamAsync(Guid teamId, int days);
}