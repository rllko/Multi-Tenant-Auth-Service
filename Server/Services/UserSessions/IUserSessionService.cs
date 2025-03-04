using System.Data;
using Authentication.Endpoints.SessionToken;
using Authentication.Models.Entities;

namespace Authentication.Services.UserSessions;

public interface IUserSessionService
{
    Task<UserSession?> GetSessionByIdAsync(Guid id);
    Task<IEnumerable<UserSession>> GetSessionsByLicenseAsync(long licenseId);
    Task<UserSession?> GetSessionByTokenAsync(Guid token);
    Task<UserSession?> GetSessionByHwidAsync(long hwid);
    Task<Result<UserSession, ValidationFailed>> CreateSessionWithTokenAsync(SignInRequest request);

    Task<UserSession> CreateLicenseSessionAsync(long licenseId, string? ipAddress = null,
        IDbTransaction? transaction = null);

    Task<Result<UserSession, ValidationFailed>> RefreshLicenseSession(UserSession sessionToken);

    /// <summary>
    ///     This will make it so the user cant refresh the session again. aka remove session token
    /// </summary>
    /// <param name="sessionToken"></param>
    /// <returns></returns>
    Task<Result<UserSession, ValidationFailed>> UpdateSessionAsync(UserSession license,
        IDbTransaction? transaction = null);

    Task<Result<UserSession, ValidationFailed>> SetupSessionHwid(UserSession userSession, HwidDto hwidDto);

    Task<bool> DeleteSessionTokenAsync(Guid id, IDbTransaction? transaction = null);
}