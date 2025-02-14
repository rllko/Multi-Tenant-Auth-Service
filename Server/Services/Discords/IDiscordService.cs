using System.Data;
using Authentication.Endpoints;
using Authentication.Endpoints.DiscordOperations.RedeemCode;
using Authentication.Models.Entities.Discord;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<DiscordUser?> CreateUserAsync(ulong discordUserId, IDbTransaction? transaction = null);
    Task<bool> DeleteUserAsync(ulong id, IDbTransaction? transaction = null);
    Task<DiscordUser?> GetByIdAsync(ulong Id);

    Task<Result<bool, ValidationFailed>> ConfirmLicenseRegistrationAsync(
        RedeemDiscordCodeDto discordCode
    );
}