using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<License> CreateLicenseAsync(ulong? discordId = null, IDbTransaction? transaction = null);

    Task<IEnumerable<License>> CreateLicenseInBulk(int amount, ulong? discordId = null);

    Task<Either<bool, ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license);
}