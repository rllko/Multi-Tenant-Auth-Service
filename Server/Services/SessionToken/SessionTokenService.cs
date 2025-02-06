namespace Authentication.Services.SessionToken;

public class SessionTokenService : ISessionTokenService
{
    public async Task<Models.Entities.SessionToken> GetSessionByIdAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<Models.Entities.SessionToken> GetSessionByLicenseAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<bool> CreateLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ResetLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> UpdateLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }
}