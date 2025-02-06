using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;

namespace Authentication.Services.Discords;

public class DiscordService : IDiscordService
{
    public async Task<License?> ConfirmLicenseRegistrationAsync(DiscordCode discordCode)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>?> GetLicenseLicenseListAsync(long discordId)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> UpdateDiscordLicensesAsync(long discordId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicensesAsync(long discordId)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseByDiscordAsync(long discordId)
    {
        throw new NotImplementedException();
    }
}