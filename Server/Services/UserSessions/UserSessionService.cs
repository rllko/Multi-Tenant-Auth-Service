using System.Data;
using Authentication.Database;
using Authentication.Endpoints.Sessions;
using Authentication.Models.Entities;
using Authentication.Services.Hwids;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Accounts;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.UserSessions;

public class UserSessionService(
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService,
    IAccountService accountService,
    IHwidService hwidService)
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

    public async Task<IEnumerable<UserSession>> GetSessionsByLicenseAsync(long licenseId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE license_id = @licenseId;";

        var results = await connection.QueryMultipleAsync(getDiscordIdQuery, new { licenseId });

        var sessions = await results.ReadAsync<UserSession>();
        return sessions;
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

    public async Task<UserSession?> GetSessionByHwidAsync(long id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM user_sessions WHERE hwid = @Id;";

        var session =
            connection.QueryFirstOrDefault<UserSession>(getDiscordIdQuery, new { hwid = id });
        return session;
    }

    public async Task<bool> LogoutLicenseSessionAsync(Guid sessionToken)
    {
        // get session by session token
        var session = await GetSessionByTokenAsync(sessionToken);

        if (session is null) return false;

        return await DeleteSessionTokenAsync(session.SessionId);
    }

    public async Task<Result<UserSession, ValidationFailed>> UpdateSessionAsync(UserSession session,
        IDbTransaction? transaction = null)
    {
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

    public async Task<Result<UserSession, ValidationFailed>> CreateSessionAsync(CreateSessionRequest request)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transaction = connection.BeginTransaction();

        // validate credentials
        if (await accountService.CheckLicensePassword(request.Username, request.Password) is false)
        {
            var error = new ValidationFailure("error", "invalid username or password");
            return new ValidationFailed(error);
        }

        // check if license is valid -- TODO create checkValidLicense
        var license = await licenseService.GetLicenseByUsername(request.Username);
        if (license is null)
        {
            var error = new ValidationFailure("error", "something went wrong D:");
            return new ValidationFailed(error);
        }

        // check for existing sessions
        var sessions = await GetSessionsByLicenseAsync(license.Id);

        if (sessions.Count() >= license.MaxSessions && license.MaxSessions > 0)
        {
            var error = new ValidationFailure("error", "max sessions reached.");
            return new ValidationFailed(error);
        }

        // check if license has time left
        if (license.ExpirationDate < DateTimeOffset.Now.ToUnixTimeSeconds())
        {
            var error = new ValidationFailure("error", "license expired.");
            return new ValidationFailed(error);
        }

        if (request.Hwid is null)
        {
            var error = new ValidationFailure("error", "hwid is required.");
            return new ValidationFailed(error);
        }

        // if limit is reached, check hwid 
        var hwids = await hwidService.GetHwidByDtoAsync(request.Hwid);

        Hwid? hwid = null;
        // Filter out those HWID DTOs that match the CPU and BIOS, but only one other property is different.
        foreach (var hwidDto in hwids)
            // Check if CPU and BIOS are the same
            if (hwidDto.Cpu == request.Hwid.cpu && hwidDto.Bios == request.Hwid.bios)
            {
                // Count how many properties differ
                var differentPropertiesCount = 0;

                if (hwidDto.Ram != request.Hwid.ram) differentPropertiesCount++;
                if (hwidDto.Disk != request.Hwid.disk) differentPropertiesCount++;
                if (hwidDto.Display != request.Hwid.display) differentPropertiesCount++;

                // If only one property differs, it's a match
                if (differentPropertiesCount == 1) hwid = hwidDto;
            }

        // if hwid correct, give him current session
        if (hwid is not null)
        {
            var session = await GetSessionByHwidAsync(hwid.Id);

            if (session?.AuthorizationToken is null || session.RefreshedAt?.Day == DateTimeOffset.Now.Day)
            {
                var error = new ValidationFailure("error", "A session already exists");
                return new ValidationFailed(error);
            }

            return await RefreshLicenseSession((Guid)session.AuthorizationToken);
        }

        // if no, create hwid
        var newHwid = await hwidService.CreateHwidAsync(request.Hwid, transaction);

        if (newHwid is null)
        {
            transaction.Rollback();
            var error = new ValidationFailure("error", "something wrong happened!");
            return new ValidationFailed(error);
        }

        // create session
        var newSession = await CreateLicenseSessionAsync(license.Id, newHwid.Id, transaction: transaction);

        transaction.Commit();
        // send session
        return newSession;
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
        if (session.ExpiresAt > 0)
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

    public async Task<UserSession> CreateLicenseSessionAsync(long licenseId, long hwidId, string? ipAddress = null,
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

    public async Task<bool> DeleteSessionTokenAsync(Guid id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM user_sessions WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
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