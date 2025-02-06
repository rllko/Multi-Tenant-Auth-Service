using Authentication.Models.Entities;

namespace Authentication.Services.SessionTokens;

public interface ISessionTokenService
{
    Task<SessionToken> GetSessionByIdAsync(long id);
    Task<SessionToken> GetSessionByLicenseAsync(string license);
    Task<bool> CreateLicenseToken(string license);
    Task<bool> ResetLicenseToken(string license);
    Task<bool> UpdateLicenseTokenAsync(string license);
    Task<bool> DeleteLicenseTokenAsync(string license);
}