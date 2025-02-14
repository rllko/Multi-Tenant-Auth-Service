using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.UserSessions;

public interface IUserSessionService
{
    Task<UserSession?> GetSessionByIdAsync(long id);
    Task<UserSession?> GetSessionByLicenseAsync(string licenseId);

    Task<UserSession> CreateLicenseSession(long licenseId, string? ipAddress, long hwidId,
        IDbTransaction? transaction = null);

    Task<Either<UserSession, ValidationFailed>> UpdateSessionTokenAsync(UserSession license,
        IDbTransaction? transaction = null);

    Task<bool> DeleteSessionTokenAsync(long id, IDbTransaction? transaction = null);
}