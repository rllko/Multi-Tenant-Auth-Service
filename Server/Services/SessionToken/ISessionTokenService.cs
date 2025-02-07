namespace Authentication.Services.SessionToken;

public interface ISessionTokenService
{
    Task<Models.Entities.SessionToken> GetSessionByIdAsync();
    Task<Models.Entities.SessionToken> GetSessionByLicenseAsync();
    Task<bool> CreateLicenseToken(string license);
    Task<bool> ResetLicenseToken(string license);
    Task<bool> UpdateLicenseTokenAsync(string license);
    Task<bool> DeleteLicenseTokenAsync(string license);
}