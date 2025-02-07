using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Services.SessionToken;

public class SessionTokenService(IValidator<Models.Entities.SessionToken> validator) : ISessionTokenService
{
    public Task<Models.Entities.SessionToken> GetSessionByIdAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Models.Entities.SessionToken> CreateLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseBySessionTokenAsync(Models.Entities.SessionToken token)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }
}