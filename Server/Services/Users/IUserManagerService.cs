using Authentication.Models;
using Authentication.Models.Entities;

namespace Authentication.Services.Users;

public interface ILicenseManagerService
{
    Task<License?> GetLicenseByIdAsync(long LicenseId);
    Task<License?> GetLicenseByEmailAsync(string LicenseEmail);
    Task<License?> GetLicenseByLicenseAsync(string license);
    Task<License?> GetLicenseByDiscordAsync(long discordId);
    Task<License?> GetLicenseByHwidAsync(long Hwid);
    Task<License?> GetLicenseByPersistanceTokenAsync(string token);
    Task<List<License>?> GetLicenseLicenseListAsync(long discordId);
    Task<int> GetLicenseHwidResetCount(string license);
    Task<bool> AssignLicenseHwidAsync(string License, Hwid hwid);
    Task<bool> UpdateLicensePersistenceTokenAsync(string license);
    Task<bool> ResetLicensePersistenceToken(string license);
    Task<bool> ResetLicenseHwidAsync(string license);
    Task<License> CreateLicenseAsync(long? discordId = null);

    Task<List<License>> CreateLicenseInBulk(int amount);
    Task<License?> ConfirmLicenseRegistrationAsync(string license, long discord, string? email = null);
    Task<License?> ConfirmLicenseRegistrationAsync(DiscordCode discordCode);
}