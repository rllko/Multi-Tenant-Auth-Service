using Authentication.Models.Entities;

namespace Authentication.Services.SessionToken;

public interface ISessionTokenService
{
    Task<UserSession> GetSessionByIdAsync();
    Task<UserSession> GetSessionByLicenseAsync();
    Task<UserSession> CreateLicenseSession(string license);
    Task<bool> UpdateLicenseTokenAsync(string license);
    Task<bool> DeleteLicenseTokenAsync(string license);
}