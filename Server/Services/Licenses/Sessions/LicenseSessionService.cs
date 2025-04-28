using System.Data;
using Authentication.Database;
using Authentication.Endpoints.SessionToken;
using Authentication.Models.Entities;
using Authentication.Services.Hwids;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Accounts;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.UserSessions;

public class LicenseSessionService(
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService,
    IAccountService accountService,
    IHwidService hwidService)
    : ILicenseSessionService
{
    public async Task<LicenseSession?> GetSessionByIdAsync(Guid id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE id = @Id;";

        var session =
            connection.QueryFirstOrDefault<LicenseSession>(getDiscordIdQuery, new { Id = id });
        return session;
    }

    public async Task<IEnumerable<LicenseSession>> GetSessionsByLicenseAsync(long licenseId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE license_id = @licenseId;";

        var results = await connection.QueryMultipleAsync(getDiscordIdQuery, new { licenseId });

        var reader = await results.ReadAsync();

        var sessions = reader.Select(x =>
        {
            var xy = x;
            return new LicenseSession
            {
                AuthorizationToken = x.session_token,
                LicenseId = x.license_id,
                RefreshedAt = x.refreshed_at,
                Active = x.is_active,
                CreatedAt = x.created_at,
                HwidId = x.hwid
            };
        });
        return sessions;
    }

    public async Task<LicenseSession?> GetSessionByTokenAsync(Guid token)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery =
            @"SELECT us.*,l.*,l.expires_at as licenseExpiration FROM user_sessions us
         join public.licenses l on l.id = us.license_id
         join hwids hw on hw.id = us.hwid
         WHERE session_token = @token;";
#warning manually map the 3 idk

        var session =
            await connection.QueryAsync<dynamic, dynamic, LicenseSession>(getDiscordIdQuery,
                (x, y) =>
                {
                    var license = new License
                    {
                        Id = y.id,
                        Value = y.value,
                        DiscordId = y.discordid,
                        MaxSessions = y.max_sessions,
                        Email = y.email,
                        Username = y.username,
                        CreationDate = y.creation_date is not null
                            ? DateTimeOffset.FromUnixTimeSeconds(y.creation_date)
                            : null,
                        ActivatedAt = y.activated_at is not null ? y.actvated_at : null,
                        Password = y.password,
                        ExpiresAt = y.expires_at,
                        Paused = y.paused,
                        Activated = y.activated
                    };

                    return new LicenseSession
                    {
                        AuthorizationToken = x.session_token,
                        LicenseId = x.license_id,
                        SessionId = x.id,
                        RefreshedAt = x.refreshed_at,
                        Active = x.is_active,
                        CreatedAt = x.created_at,
                        HwidId = x.hwid,
                        License = license
                    };
                }
                , new
                {
                    token
                }, splitOn: "id,license_id");

        return session.FirstOrDefault();
    }

    public async Task<LicenseSession?> GetSessionByHwidAsync(long id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE hwid = @Id;";

        var session =
            connection.QueryFirstOrDefault<LicenseSession>(getDiscordIdQuery, new { hwid = id });
        return session;
    }

    public async Task<Result<LicenseSession, ValidationFailed>> UpdateSessionAsync(LicenseSession session,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery =
            @"UPDATE user_sessions
	        SET session_token = @SessionId,
                hwid = CASE WHEN @HwidId IS NOT NULL THEN @HwidId ELSE hwid END, 
                license_id = @LicenseId,
                ip_address = CASE WHEN @IpAddress IS NOT NULL THEN @IpAddress ELSE ip_address END,
                refreshed_at = CASE WHEN @RefreshedAt IS NOT NULL THEN @RefreshedAt ELSE refreshed_at END
	        WHERE id = @SessionId returning session_token";

        var newSessionToken =
            await connection.QueryFirstAsync<Guid>(addDiscordIdQuery,
                new
                {
                    session,
                    session.SessionId,
                    session.HwidId,
                    session.LicenseId,
                    session.IpAddress,
                    session.RefreshedAt
                },
                transaction);

        var newSession = await GetSessionByTokenAsync(newSessionToken);

        if (newSession != null) return newSession;
        throw new Exception("what");
    }

    public async Task<Result<LicenseSession, ValidationFailed>> CreateSessionWithTokenAsync(SignInRequest request)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transaction = connection.BeginTransaction();

        // validate credentials
        if (await accountService.CheckLicensePassword(request.Username, request.Password) is false)
        {
            var error = new ValidationFailure("invalid_credentials", "invalid username or password");
            return new ValidationFailed(error);
        }

        // check if license is valid -- TODO create checkValidLicense
        var license = await licenseService.GetLicenseByUsername(request.Username);
        if (license is null)
        {
            var error = new ValidationFailure("internal_error", "something went wrong D:");
            return new ValidationFailed(error);
        }

        // check for existing sessions
        var sessions = await GetSessionsByLicenseAsync(license.Id);

        if (sessions?.Count() >= license.MaxSessions && license.MaxSessions > 0)
        {
            var error = new ValidationFailure("error_max_sessions", "max sessions reached.");
            return new ValidationFailed(error);
        }

        // check if license has time left
        if (license.ExpiresAt < DateTimeOffset.Now.ToUnixTimeSeconds())
        {
            var error = new ValidationFailure("error_license_expired", "license expired.");
            return new ValidationFailed(error);
        }

        var newSession = await CreateLicenseSessionAsync(license.Id, transaction: transaction);

        transaction.Commit();

        return newSession;
    }

    public async Task<Result<LicenseSession, ValidationFailed>> RefreshLicenseSession(LicenseSession session)
    {
        session.RefreshedAt = DateTimeOffset.Now.ToUnixTimeSeconds();
        var result = await UpdateSessionAsync(session);
        return result;
    }

    public async Task<bool> DeleteSessionTokenAsync(Guid id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"UPDATE user_sessions SET session_token = null WHERE id = @id;";
        //const string addDiscordIdQuery = @"DELETE FROM user_sessions WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<LicenseSession> CreateLicenseSessionAsync(long licenseId, string? ipAddress = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var createdAt = DateTimeOffset.Now;

        var expiration = DateTimeOffset.Now.AddDays(1);

        const string query = @"INSERT INTO user_sessions (license_id, ip_address,created_at,refreshed_at)
        VALUES ( @licenseId, @ipAddress,@expiration,@createdAt) RETURNING *;";

        var reader =
            await connection.QueryAsync(query,
                new
                {
                    licenseId, ipAddress, expiration = expiration.ToUnixTimeSeconds(),
                    createdAt = createdAt.ToUnixTimeSeconds()
                },
                transaction);

        var license = await licenseService.GetLicenseByIdAsync(licenseId);

        var newSession = reader.Select(x =>
        {
            var xy = x;
            return new LicenseSession
            {
                AuthorizationToken = x.session_token,
                LicenseId = x.license_id,
                Active = x.is_active,
                RefreshedAt = x.refreshed_at,
                CreatedAt = x.created_at,
                HwidId = x.hwid,
                License = license
            };
        }).First();

        return newSession;
    }

    public async Task<Result<LicenseSession, ValidationFailed>> SetupSessionHwid(LicenseSession licenseSession,
        HwidDto hwidDto)
    {
        var hwid = await hwidService.GetHwidByDtoAsync(hwidDto) ?? await hwidService.CreateHwidAsync(hwidDto);

        if (hwid is null)
        {
            var error = new ValidationFailure("error", "hwid could not be created");
            return new ValidationFailed(error);
        }

        licenseSession.HwidId = hwid.Id;
        return await UpdateSessionAsync(licenseSession);
    }

    public async Task<LicenseSession?> GetSessionByAccessTokenAsync(string sessionToken)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE session_token = @sessionToken;";

        var session =
            connection.QueryFirstOrDefault<LicenseSession>(getDiscordIdQuery, new { licenseId = sessionToken });
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