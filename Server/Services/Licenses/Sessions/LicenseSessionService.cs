using System.Data;
using Authentication.Database;
using Authentication.Endpoints.Authentication.LicenseAuthentication;
using Authentication.Models.Entities;
using Authentication.Services.Hwids;
using Authentication.Services.Licenses.Accounts;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.Licenses.Sessions;

public class LicenseSessionService(
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService,
    IAccountService accountService,
    IHwidService hwidService)
    : ILicenseSessionService
{
    public async Task<LicenseSession?> GetSessionByIdAsync(Guid id)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT
                id AS session_id,
                session_token,
                hwid,
                license_id,
                refreshed_at,
                is_active,
                created_at
            FROM user_sessions
            WHERE id = @Id;";

        var row = await connection.QueryFirstOrDefaultAsync(query, new { Id = id });
        return row is null ? null : MapSession(row);
    }

    public async Task<IEnumerable<LicenseSession>> GetSessionsByLicenseAsync(long licenseId)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT
                id AS session_id,
                session_token,
                hwid,
                license_id,
                refreshed_at,
                is_active,
                created_at
            FROM user_sessions
            WHERE license_id = @licenseId
              AND is_active IS TRUE;";

        var rows = await connection.QueryAsync(query, new { licenseId });
        return rows.Select(MapSession).ToList();
    }

    public async Task<LicenseSession?> GetSessionByTokenAsync(Guid token)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT
                us.id AS session_id,
                us.session_token,
                us.hwid,
                us.license_id,
                us.refreshed_at,
                us.is_active,
                us.created_at,
                l.id AS l_id,
                l.value AS l_value,
                l.discordid AS l_discordid,
                l.max_sessions AS l_max_sessions,
                l.email AS l_email,
                l.username AS l_username,
                l.creation_date AS l_creation_date,
                l.activated_at AS l_activated_at,
                l.password AS l_password,
                l.expires_at AS l_expires_at,
                l.paused AS l_paused,
                l.activated AS l_activated,
                l.application AS l_application,
                l.banned AS l_banned,
                l.revoked AS l_revoked,
                l.revoked_at AS l_revoked_at
            FROM user_sessions us
            JOIN public.licenses l ON l.id = us.license_id
            LEFT JOIN hwids hw ON hw.id = us.hwid
            WHERE us.session_token = @token;";

        var row = await connection.QueryFirstOrDefaultAsync(query, new { token });
        return row is null ? null : MapSessionWithLicense(row);
    }

    public async Task<LicenseSession?> GetSessionByHwidAsync(long id)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT
                id AS session_id,
                session_token,
                hwid,
                license_id,
                refreshed_at,
                is_active,
                created_at
            FROM user_sessions
            WHERE hwid = @id;";

        var row = await connection.QueryFirstOrDefaultAsync(query, new { id });
        return row is null ? null : MapSession(row);
    }

    public async Task<Result<LicenseSession, ValidationFailed>> UpdateSessionAsync(LicenseSession session,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"
                UPDATE user_sessions
                SET session_token = COALESCE(@AuthorizationToken, session_token),
                    hwid = COALESCE(@HwidId, hwid),
                    license_id = @LicenseId,
                    refreshed_at = COALESCE(@RefreshedAt, refreshed_at),
                    is_active = @Active
                WHERE id = @SessionId
                RETURNING session_token;";

            var newSessionToken = await connection.QueryFirstAsync<Guid>(query,
                new
                {
                    session.AuthorizationToken,
                    session.SessionId,
                    session.HwidId,
                    session.LicenseId,
                    session.RefreshedAt,
                    session.Active
                },
                transaction);

            var newSession = await GetSessionByTokenAsync(newSessionToken);
            if (newSession != null) return newSession;

            var error = new ValidationFailure("session", "session could not be updated");
            return new ValidationFailed(error);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<Result<LicenseSession, ValidationFailed>> CreateSessionWithTokenAsync(SignInRequest request)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        if (await accountService.CheckLicensePassword(request.Username, request.Password) is false)
        {
            var error = new ValidationFailure("invalid_credentials", "invalid username or password");
            return new ValidationFailed(error);
        }

        var license = await licenseService.GetLicenseByUsername(request.Username);

        if (license is null)
        {
            var error = new ValidationFailure("internal_error", "something went wrong D:");
            return new ValidationFailed(error);
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (license.Paused)
        {
            var error = new ValidationFailure("license_paused", "license is paused");
            return new ValidationFailed(error);
        }

        if (license.Banned)
        {
            var error = new ValidationFailure("license_banned", "license is banned");
            return new ValidationFailed(error);
        }

        if (license.Revoked)
        {
            var error = new ValidationFailure("license_revoked", "license is revoked");
            return new ValidationFailed(error);
        }

        if (license.ExpiresAt <= now)
        {
            var error = new ValidationFailure("error_license_expired", "license expired.");
            return new ValidationFailed(error);
        }

        var sessions = await GetSessionsByLicenseAsync(license.Id);
        if (sessions.Count() >= license.MaxSessions && license.MaxSessions > 0)
        {
            var error = new ValidationFailure("error_max_sessions", "max sessions reached.");
            return new ValidationFailed(error);
        }

        var newSession = await CreateLicenseSessionAsync(license.Id, transaction: transaction);
        transaction.Commit();

        return newSession;
    }

    public async Task<Result<LicenseSession, ValidationFailed>> RefreshLicenseSession(LicenseSession session)
    {
        session.RefreshedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var result = await UpdateSessionAsync(session);

        return result;
    }

    public async Task<bool> DeleteSessionTokenAsync(Guid id, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"UPDATE user_sessions SET session_token = null, is_active = false WHERE id = @id;";
            var affectedRows = await connection.ExecuteAsync(query, new { id }, transaction);

            return affectedRows > 0;
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<int> RevokeSessionsByLicenseAsync(long licenseId, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"
                UPDATE user_sessions
                SET is_active = false
                WHERE license_id = @licenseId
                  AND is_active IS TRUE;";

            return await connection.ExecuteAsync(query, new { licenseId }, transaction);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<LicenseSession> CreateLicenseSessionAsync(long licenseId, string? ipAddress = null,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            var license = await licenseService.GetLicenseByIdAsync(licenseId, transaction);
            if (license is null) throw new InvalidOperationException("license could not be found");

            var createdAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            const string query = @"
                INSERT INTO user_sessions (license_id, ip_address, created_at, refreshed_at, application)
                VALUES (@licenseId, @ipAddress, @createdAt, @refreshedAt, @application)
                RETURNING
                    id AS session_id,
                    session_token,
                    hwid,
                    license_id,
                    refreshed_at,
                    is_active,
                    created_at;";

            var row = await connection.QueryFirstAsync(query,
                new
                {
                    licenseId,
                    ipAddress,
                    createdAt,
                    refreshedAt = createdAt,
                    application = license.Application
                },
                transaction);

            var newSession = MapSession(row);
            newSession.License = license;

            return newSession;
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
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
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT
                id AS session_id,
                session_token,
                hwid,
                license_id,
                refreshed_at,
                is_active,
                created_at
            FROM user_sessions
            WHERE session_token = @sessionToken;";

        var row = await connection.QueryFirstOrDefaultAsync(query, new { sessionToken });
        return row is null ? null : MapSession(row);
    }

    public async Task<LicenseDto?> GetLicenseBySessionTokenAsync(long sessionId)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT l.id
            FROM user_sessions us
            INNER JOIN licenses l ON us.license_id = l.id
            WHERE us.id = @sessionId;";

        var licenseId = await connection.QueryFirstOrDefaultAsync<long?>(query, new { sessionId });
        if (licenseId is null) return null;

        var license = await licenseService.GetLicenseByIdAsync(licenseId.Value);
        return license?.MapToDto();
    }

    private async Task<IDbConnection> GetConnectionAsync(IDbTransaction? transaction)
    {
        return transaction?.Connection ?? await connectionFactory.CreateConnectionAsync();
    }

    private static void DisposeIfOwned(IDbConnection connection, IDbTransaction? transaction)
    {
        if (transaction?.Connection is null) connection.Dispose();
    }

    private static LicenseSession MapSession(dynamic row)
    {
        var values = (IDictionary<string, object?>)row;

        return new LicenseSession
        {
            AuthorizationToken = ToGuid(values, "session_token"),
            LicenseId = ToLong(values, "license_id") ?? 0,
            SessionId = ToGuid(values, "session_id") ?? Guid.Empty,
            RefreshedAt = ToLong(values, "refreshed_at"),
            Active = ToBool(values, "is_active"),
            CreatedAt = ToLong(values, "created_at") ?? 0,
            HwidId = ToLong(values, "hwid")
        };
    }

    private static LicenseSession MapSessionWithLicense(dynamic row)
    {
        var values = (IDictionary<string, object?>)row;
        var session = MapSession(row);
        session.License = new License
        {
            Id = ToLong(values, "l_id")!.Value,
            Value = ToGuid(values, "l_value")!.Value,
            Application = ToGuid(values, "l_application") ?? Guid.Empty,
            DiscordId = ToLong(values, "l_discordid"),
            MaxSessions = ToShort(values, "l_max_sessions") ?? 1,
            Email = ToString(values, "l_email"),
            Username = ToString(values, "l_username"),
            CreationDate = DateTimeOffset.FromUnixTimeSeconds(ToLong(values, "l_creation_date") ?? 0),
            ActivatedAt = ToLong(values, "l_activated_at"),
            Password = ToString(values, "l_password"),
            ExpiresAt = ToLong(values, "l_expires_at") ?? 0,
            Paused = ToBool(values, "l_paused"),
            Activated = ToBool(values, "l_activated"),
            Banned = ToBool(values, "l_banned"),
            Revoked = ToBool(values, "l_revoked"),
            RevokedAt = ToLong(values, "l_revoked_at")
        };

        return session;
    }

    private static string? ToString(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToString(value) : null;
    }

    private static long? ToLong(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToInt64(value) : null;
    }

    private static short? ToShort(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToInt16(value) : null;
    }

    private static bool ToBool(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is bool boolValue && boolValue;
    }

    private static Guid? ToGuid(IDictionary<string, object?> values, string key)
    {
        if (values.TryGetValue(key, out var value) is false || value is null) return null;
        return value switch
        {
            Guid guid => guid,
            string stringValue when Guid.TryParse(stringValue, out var guid) => guid,
            _ => null
        };
    }
}
