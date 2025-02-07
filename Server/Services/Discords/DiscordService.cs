using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;
using FluentValidation;

namespace Authentication.Services.Discords;

public class DiscordService(IValidator<DiscordCode> validator, IDbConnectionFactory connectionFactory) : IDiscordService
{
    public Task<DiscordUser?> GetDiscordFromLicenseAsync(long licenceId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateLicenseOwnershipAsync(long oldId, long newId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteDiscordUserAsync(long id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ConfirmLicenseRegistrationAsync(DiscordCode discordCode)
    {
        throw new NotImplementedException();
    }
}