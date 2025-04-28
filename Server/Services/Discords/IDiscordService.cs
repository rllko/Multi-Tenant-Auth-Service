using System.Data;
using Authentication.Endpoints.DiscordOperationEndpoints.RedeemCode;
using Authentication.Models.Entities;

namespace Authentication.Services.Discords;

public interface IDiscordService
{
    Task<DiscordUser> CreateUserAsync(long discordUserId, IDbTransaction? transaction = null);
    Task<bool> DeleteUserAsync(ulong id, IDbTransaction? transaction = null);
    Task<DiscordUser?> GetByIdAsync(long id);

    Task<Result<string, ValidationFailed>> ConfirmLicenseRegistrationAsync(RedeemLicenseRequestDto licenseRequest);
}