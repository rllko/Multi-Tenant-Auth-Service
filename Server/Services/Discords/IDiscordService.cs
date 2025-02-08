using System.Data;
using Authentication.Models.Entities.Discord;
using Authentication.Services.Licenses;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<DiscordUser?> GetDiscordFromLicenseAsync(long licenceId);
    Task<bool> UpdateLicenseOwnershipAsync(ulong oldId, ulong newId);
    Task<bool> CreateUserAsync(ulong discordUserId, IDbTransaction? transaction = null);
    Task<bool> DeleteUserAsync(ulong id, IDbTransaction? transaction = null);
    Task<DiscordUser?> GetByIdAsync(ulong Id);

    Task<Either<bool, ValidationFailed>> ConfirmLicenseRegistrationAsync(
        RedeemDiscordCodeDto discordCode,
        ILicenseService licenseService);
}