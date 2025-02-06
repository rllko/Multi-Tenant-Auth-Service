using Authentication.Models.Entities;

namespace Authentication.Services.Licenses;

public interface ILicenseBuilder
{
    Task<License> CreateLicenseAsync(long? discordId = null);
    Task<List<License>> CreateLicenseInBulk(int amount);
    Task<License?> ConfirmLicenseRegistrationAsync(string license, long discord, string? email = null);
}