using System.Data;
using Authentication.Database;
using Authentication.Endpoints.Sessions;
using Authentication.Models.Entities;
using Authentication.Services.Licenses.Accounts;
using Dapper;
using FluentValidation;
using FluentValidation.Results;

namespace Authentication.Services.UserSessions;

public class UserSessionService(
    IDbConnectionFactory connectionFactory,
    IValidator<UserSession> validator,
    IAccountService accountService)
    : IUserSessionService
{
    public async Task<UserSession?> GetSessionByIdAsync(Guid id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE id = @Id;";

        var session =
            connection.QueryFirstOrDefault<UserSession>(getDiscordIdQuery, new { Id = id });
        return session;
    }

    public async Task<UserSession?> GetSessionByLicenseAsync(string licenseId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE license_id = @licenseId;";

        var session =
            connection.QueryFirstOrDefault<UserSession>(getDiscordIdQuery, new { licenseId });
        return session;
    }

    public async Task<UserSession?> GetSessionByTokenAsync(Guid token)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery =
            @"SELECT us.*,l.* FROM user_sessions us
         inner join public.licenses l on l.id = us.license_id
         WHERE session_token = @token;";

        var session =
            await connection.QueryAsync<UserSession, License, UserSession>(getDiscordIdQuery,
                (session, license) =>
                {
                    session.License = license;
                    return session;
                }, new { token });

        return session.FirstOrDefault();
    }

    public async Task<bool> LogoutLicenseSessionAsync(Guid sessionToken)
    {
        // get session by session token
        var session = await GetSessionByTokenAsync(sessionToken);

        if (session is null) return false;

        // remove session token
        session.AuthorizationToken = null;
        var _ = UpdateSessionAsync(session);
        return true;
    }

    public async Task<Result<UserSession, ValidationFailed>> UpdateSessionAsync(UserSession session,
        IDbTransaction? transaction = null)
    {
        var validationResult = await validator.ValidateAsync(session);
        if (!validationResult.IsValid) return new ValidationFailed(validationResult.Errors);

        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery =
            @"UPDATE user_sessions
	        SET session_token = @SessionId, hwid = @HwidId,
                license_id = @LicenseId, ip_address = @IpAddress,
                created_at = @CreatedAt, refreshed_at = @RefreshedAt
	        WHERE id = @SessionId returning *";
        var newSession =
            await connection.QuerySingleAsync<UserSession>(addDiscordIdQuery, new { session }, transaction);

        return newSession;
    }

    public async Task<bool> DeleteSessionTokenAsync(long id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM user_sessions WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<UserSession> CreateLicenseSessionAsync(long licenseId, string? ipAddress, long hwidId,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery = @"INSERT INTO user_sessions (license_id, ip_address,hwid)
        VALUES ( @licenseId, @ipAddress,@hwidId) RETURNING *;";
        var newUser =
            await connection.QuerySingleAsync<UserSession>(addDiscordIdQuery, new { licenseId, ipAddress, hwidId },
                transaction);

        return newUser;
    }

    public async Task<Result<UserSession, ValidationFailed>> SignInUserAsync(CreateSessionRequest request)
    {
        // validate credentials

        // check if license is valid -- TODO create checkValidLicense

        // check for existing sessions

        // check if existing session was created today

        // check if license has time left

        // if limit is reached, check hwid 

        // if hwid correct, give him current session

        // BadRequest if wrong

        // if no, create hwid

        // create session

        // send session
        throw new NotImplementedException();
    }

    public async Task<Result<UserSession, ValidationFailed>> RefreshLicenseSession(Guid sessionToken)
    {
        // get session by session token
        var session = await GetSessionByTokenAsync(sessionToken);

        // check if session is active
        if (session is null)
        {
            var error = new ValidationFailure("error", "Session could not be found");
            return new ValidationFailed(error);
        }

        // check if session has time left
        if (session.ExpirationTime > 0)
        {
            var error = new ValidationFailure("error", "Session could not be created");
            return new ValidationFailed(error);
        }

        // if it was created more than one day ago, refresh
        if (session.CreatedAt.Day != DateTime.Now.Day &&
            session.RefreshedAt != null &&
            session.RefreshedAt.Value.Day != DateTime.Now.Day)
        {
            var error = new ValidationFailure("error", "Session could not be created");
            return new ValidationFailed(error);
        }

        session.RefreshedAt = DateTime.Now;
        var result = await UpdateSessionAsync(session);
        return result;
    }

    public async Task<UserSession?> GetSessionByAccessTokenAsync(string sessionToken)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE session_token = @sessionToken;";

        var session =
            connection.QueryFirstOrDefault<UserSession>(getDiscordIdQuery, new { licenseId = sessionToken });
        return session;
    }

    public async Task<LicenseDto?> GetLicenseBySessionTokenAsync(long sessionId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery =
            @"SELECT l.*  FROM user_sessions us INNER JOIN licenses l ON us.license_id = l.id WHERE us.id = @sessionId;";

        var session = await
            connection.QueryFirstOrDefaultAsync<LicenseDto>(getDiscordIdQuery, new { sessionId });
        return session;
    }
}