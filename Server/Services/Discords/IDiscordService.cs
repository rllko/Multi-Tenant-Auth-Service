using Authentication.Models.Entities.Discord;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<DiscordUser?> GetDiscordFromLicenseAsync(long licenceId);
    Task<bool> UpdateLicenseOwnershipAsync(long oldId, long newId);
    Task<bool> DeleteDiscordUserAsync(long id);
    Task<Either<bool, ValidationFailed>> ConfirmLicenseRegistrationAsync(DiscordCode discordCode);
}