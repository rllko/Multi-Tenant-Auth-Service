using System.Data;
using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<License> CreateLicenseAsync(long? discordId = null, IDbTransaction? transaction = null);
    Task<IEnumerable<string>> CreateLicenseInBulk(int amount);
    Task<Either<bool, ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license);
}