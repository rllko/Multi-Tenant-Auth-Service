using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<License?> ConfirmLicenseRegistrationAsync(DiscordCode discordCode);
    Task<List<License>?> GetLicenseLicenseListAsync(long discordId);
    Task<License?> UpdateDiscordLicensesAsync(long discordId);
    Task<bool> DeleteLicensesAsync(long discordId);
}