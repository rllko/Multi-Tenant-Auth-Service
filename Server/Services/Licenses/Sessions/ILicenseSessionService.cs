using System.Data;
using Authentication.Endpoints.Authentication.LicenseAuthentication;
using Authentication.Models.Entities;

namespace Authentication.Services.Licenses.Sessions;

public interface ILicenseSessionService
{
    Task<LicenseSession?> GetSessionByIdAsync(Guid id);
    Task<IEnumerable<LicenseSession>> GetSessionsByLicenseAsync(long licenseId);
    Task<LicenseSession?> GetSessionByTokenAsync(Guid token);
    Task<LicenseSession?> GetSessionByHwidAsync(long hwid);
    Task<Result<LicenseSession, ValidationFailed>> CreateSessionWithTokenAsync(SignInRequest request);

    Task<LicenseSession> CreateLicenseSessionAsync(long licenseId, string? ipAddress = null,
        IDbTransaction? transaction = null);

    Task<Result<LicenseSession, ValidationFailed>> RefreshLicenseSession(LicenseSession sessionToken);

    /// <summary>
    ///     This will make it so the user cant refresh the session again. aka remove session token
    /// </summary>
    /// <param name="sessionToken"></param>
    /// <returns></returns>
    Task<Result<LicenseSession, ValidationFailed>> UpdateSessionAsync(LicenseSession license,
        IDbTransaction? transaction = null);

    Task<Result<LicenseSession, ValidationFailed>> SetupSessionHwid(LicenseSession licenseSession, HwidDto hwidDto);

    Task<bool> DeleteSessionTokenAsync(Guid id, IDbTransaction? transaction = null);
}