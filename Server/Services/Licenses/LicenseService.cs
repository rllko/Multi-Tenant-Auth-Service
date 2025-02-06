using Authentication.Models.Entities;

namespace Authentication.Services.Licenses;

public class LicenseService : ILicenseService
{
    public async Task<List<License>> GetLicensesByDiscordId(long discordId)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseByIdAsync(long licenseId)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseByValueAsync(long license)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>?> GetLicensesByHwidAsync(Hwid hwid)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseBySessionTokenAsync(string token)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseByCreationDateAsync(long license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ResetLicenseHwidAsync(long id)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseAsync(long id)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>> GetLicenseByDiscordId(long discordId)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> GetLicenseByValueAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<int> GetLicenseHwidResetCount(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ResetLicenseHwidAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<License> CreateLicenseAsync(long? discordId = null)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>> CreateLicenseInBulk(int amount)
    {
        throw new NotImplementedException();
    }

    public async Task<License?> ConfirmLicenseRegistrationAsync(string license, long discord, string? email = null)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseAsync(string license)
    {
        throw new NotImplementedException();
    }
}