using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<Result<License, ValidationFailed>> CreateLicenseAsync(int licenseExpirationInDays,
        long? discordId = null, string? username = null,
        string? email = null, string? password = null,
        IDbTransaction? transaction = null);

    Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, long? discordId = null,
        IDbTransaction? transaction = null);
}