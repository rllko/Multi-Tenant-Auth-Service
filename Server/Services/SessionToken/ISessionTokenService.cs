using System.Data;
using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.SessionToken;

public interface ISessionTokenService
{
    Task<UserSession?> GetSessionByIdAsync(long id);
    Task<UserSession?> GetSessionByLicenseAsync(string licenseId);

    Task<UserSession> CreateLicenseSession(long licenseId, string ipAddress, long hwidId,
        IDbTransaction? transaction = null);

    Task<Either<UserSession, ValidationFailed>> UpdateSessionTokenAsync(UserSession license,
        IDbTransaction? transaction = null);

    Task<bool> DeleteSessionTokenAsync(long id, IDbTransaction? transaction = null);
}