using System.Data;
using Authentication.Endpoints.Sessions;
using Authentication.Models.Entities;

namespace Authentication.Services.UserSessions;

public interface IUserSessionService
{
    Task<UserSession?> GetSessionByIdAsync(Guid id);
    Task<IEnumerable<UserSession>> GetSessionsByLicenseAsync(long licenseId);
    Task<UserSession?> GetSessionByTokenAsync(Guid token);
    Task<UserSession?> GetSessionByHwidAsync(long hwid);
    Task<Result<UserSession, ValidationFailed>> CreateSessionAsync(CreateSessionRequest request);

    Task<UserSession> CreateLicenseSessionAsync(long licenseId, long hwidId, string? ipAddress = null,
        IDbTransaction? transaction = null);

    Task<Result<UserSession, ValidationFailed>> RefreshLicenseSession(Guid sessionToken);

    /// <summary>
    ///     This will make it so the user cant refresh the session again. aka remove session token
    /// </summary>
    /// <param name="sessionToken"></param>
    /// <returns></returns>
    Task<bool> LogoutLicenseSessionAsync(Guid sessionToken);

    Task<Result<UserSession, ValidationFailed>> UpdateSessionAsync(UserSession license,
        IDbTransaction? transaction = null);

    Task<bool> DeleteSessionTokenAsync(long id, IDbTransaction? transaction = null);
}