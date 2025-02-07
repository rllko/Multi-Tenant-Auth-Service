using Authentication.Database;
using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Services.Licenses;

public class LicenseService(IValidator<License> validator, IDbConnectionFactory connectionFactory) : ILicenseService
{
    public Task<List<License>> GetLicensesByDiscordId(long discordId)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByIdAsync(long licenseId)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByValueAsync(long license)
    {
        throw new NotImplementedException();
    }

    public Task<Models.Entities.SessionToken> GetSessionByLicenseAsync(License license)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByCreationDateAsync(DateTime license)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ResetLicenseHwidAsync(long id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteLicenseAsync(long id)
    {
        throw new NotImplementedException();
    }
}