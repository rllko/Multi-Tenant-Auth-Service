using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<License> CreateLicenseAsync(ulong? discordId = null, IDbTransaction? transaction = null);

    Task<IEnumerable<License>> CreateLicenseInBulk(int amount, ulong? discordId = null);

    Task<Result<bool, ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license);
}