using System.Data;
using Authentication.Models.Entities;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<Result<License, ValidationFailed>> CreateLicenseAsync(int licenseExpirationInDays,
        long? discordId = null, string? username = null,
        string? email = null, string? password = null,
        IDbTransaction? transaction = null);

    Task<Result<License, ValidationFailed>> CreateLicenseAsync(Guid application, int licenseExpirationInDays,
        short? maxSessions = null, long? discordId = null, string? username = null,
        string? email = null, string? password = null, Guid? customValue = null,
        IDbTransaction? transaction = null);

    Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, int licenseExpirationInDays,
        long? discordId = null, string? email = null, string? password = null,
        IDbTransaction? transaction = null);
}