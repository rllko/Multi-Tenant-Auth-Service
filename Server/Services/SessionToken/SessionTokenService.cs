using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Services.SessionToken;

public class SessionTokenService(IValidator<UserSession> validator) : ISessionTokenService
{
    public Task<UserSession> GetSessionByIdAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<UserSession> GetSessionByLicenseAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<UserSession> CreateLicenseSession(string license)
    {
        throw new NotImplementedException();
    }

    public Task<UserSession> CreateLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseBySessionTokenAsync(long SessionId)
    {
    }

    public Task<bool> DeleteLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }