using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<DiscordUser?> GetDiscordFromLicenseAsync(long licenceId);
    Task<bool> UpdateLicenseOwnershipAsync(long oldId, long newId);
    Task<bool> DeleteDiscordUserAsync(long id);
    Task<bool> ConfirmLicenseRegistrationAsync(DiscordCode discordCode);
}