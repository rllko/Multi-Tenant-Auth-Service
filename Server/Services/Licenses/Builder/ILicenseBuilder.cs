using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<Result<License, ValidationFailed>> CreateLicenseAsync(long? discordId = null, string? email = null,
        IDbTransaction? transaction = null);

    Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, long? discordId = null,
        IDbTransaction? transaction = null);
}