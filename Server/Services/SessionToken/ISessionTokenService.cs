namespace Authentication.Services.SessionToken;

public interface ISessionTokenService
{
    Task<Models.Entities.SessionToken> GetSessionByIdAsync();

    Task<Models.Entities.SessionToken> CreateLicenseToken(string license);
    Task<bool> UpdateLicenseTokenAsync(string license);
    Task<License?> GetLicenseBySessionTokenAsync(Models.Entities.SessionToken token);
    Task<bool> DeleteLicenseTokenAsync(string license);
}