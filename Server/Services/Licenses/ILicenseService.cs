using System.Data;
using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Licenses;

public interface ILicenseService
{
    Task<List<License>> GetLicensesByDiscordId(long discordId);
    Task<License?> GetLicenseByIdAsync(long licenseId);
    Task<License?> GetLicenseByValueAsync(long license);
    Task<Either<bool, ValidationFailed>> AssignLicenseHwidAsync(string license, Hwid hwid);
    Task<Either<Models.Entities.SessionToken, ValidationFailed>> GetSessionByLicenseAsync(License license);
    Task<License?> GetLicenseByCreationDateAsync(DateTime license);
    Task<bool> ResetLicenseHwidAsync(long id);
    Task<bool> DeleteLicenseAsync(long id);
    Task<List<License>> GetAllLicensesAsync();
    Task<bool> UpdateUserLicenseListAsync(ulong oldDiscordId, ulong newDiscordId, List<License> licenses);
    Task<Either<License, ValidationFailed>> UpdateLicenseAsync(License license, IDbTransaction? transaction = null);
    Task<Either<DiscordCode, ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license);
}