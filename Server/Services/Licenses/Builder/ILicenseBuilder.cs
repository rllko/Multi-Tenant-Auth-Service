using System.Data;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public interface ILicenseBuilder
{
    Task<License> CreateLicenseAsync(long? discordId = null, IDbTransaction? transaction = null);
    Task<List<License>> CreateLicenseInBulk(int amount);
    Task<License?> ConfirmLicenseRegistrationAsync(string license, long discord, string? email = null);
    Task<Either<DiscordCode, LicenseValidator.ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license);
}