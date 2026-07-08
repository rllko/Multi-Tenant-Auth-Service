using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using FluentValidation.Results;
using LanguageExt;

namespace Authentication.Services.Licenses;

public class LicenseService(IDbConnectionFactory connectionFactory) : ILicenseService
{
    private const string LicenseColumns = @"
        id,
        value,
        discordid,
        max_sessions,
        email,
        username,
        creation_date,
        activated_at,
        password,
        expires_at,
        paused,
        activated,
        application,
        banned,
        revoked,
        revoked_at";

    public async Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId)
    {
        var connection = await OpenConnectionAsync();
        try
        {
            var rows = await connection.QueryAsync($"SELECT {LicenseColumns} FROM licenses WHERE discordid = @discordId;",
                new { discordId });

            return rows.Select(MapLicense).ToList();
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<License?> GetLicenseByIdAsync(long licenseId, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            var row = await connection.QuerySingleOrDefaultAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE id = @licenseId;",
                new { licenseId }, transaction);

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<License?> GetLicenseByValueAsync(Guid licenseValue, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            var row = await connection.QuerySingleOrDefaultAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE value = @licenseValue;",
                new { licenseValue }, transaction);

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<License?> GetLicenseByCreationDateAsync(DateTime date)
    {
        var connection = await OpenConnectionAsync();
        try
        {
            var row = await connection.QuerySingleOrDefaultAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE creation_date = @date;",
                new { date });

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<License?> GetLicenseForAppAsync(long licenseId, Guid appId, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            var row = await connection.QuerySingleOrDefaultAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE id = @licenseId AND application = @appId;",
                new { licenseId, appId }, transaction);

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<IEnumerable<License>> GetAllLicensesAsync()
    {
        var connection = await OpenConnectionAsync();
        try
        {
            var rows = await connection.QueryAsync($"SELECT {LicenseColumns} FROM licenses;");
            return rows.Select(MapLicense).ToList();
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<License?> UpdateLicenseAsync(License license,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"
                UPDATE licenses
                SET
                    password = @Password,
                    username = @Username,
                    discordid = @DiscordId,
                    email = @Email,
                    paused = @Paused,
                    activated = @Activated,
                    activated_at = @ActivatedAt,
                    max_sessions = @MaxSessions,
                    expires_at = @ExpiresAt,
                    banned = @Banned,
                    revoked = @Revoked,
                    revoked_at = @RevokedAt
                WHERE id = @Id
                RETURNING
                    id,
                    value,
                    discordid,
                    max_sessions,
                    email,
                    username,
                    creation_date,
                    activated_at,
                    password,
                    expires_at,
                    paused,
                    activated,
                    application,
                    banned,
                    revoked,
                    revoked_at;";

            var row = await connection.QuerySingleOrDefaultAsync(query, new
            {
                license.Password,
                license.Username,
                license.DiscordId,
                license.Email,
                license.Paused,
                license.Activated,
                license.ActivatedAt,
                license.MaxSessions,
                license.ExpiresAt,
                license.Banned,
                license.Revoked,
                license.RevokedAt,
                license.Id
            }, transaction);

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<License?> ExtendLicenseForAppAsync(long licenseId, Guid appId, int amount, string unit,
        IDbTransaction? transaction = null)
    {
        if (amount <= 0) return null;

        var license = await GetLicenseForAppAsync(licenseId, appId, transaction);
        if (license is null) return null;

        if (TryCalculateExtendedExpiration(license.ExpiresAt, amount, unit, out var newExpiration) is false)
            return null;

        license.ExpiresAt = newExpiration;
        return await UpdateLicenseAsync(license, transaction);
    }

    public async Task<License?> SetLicenseBannedAsync(long licenseId, Guid appId, bool banned,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"
                UPDATE licenses
                SET banned = @banned
                WHERE id = @licenseId AND application = @appId
                RETURNING
                    id,
                    value,
                    discordid,
                    max_sessions,
                    email,
                    username,
                    creation_date,
                    activated_at,
                    password,
                    expires_at,
                    paused,
                    activated,
                    application,
                    banned,
                    revoked,
                    revoked_at;";

            var row = await connection.QuerySingleOrDefaultAsync(query, new { licenseId, appId, banned }, transaction);
            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<License?> SetLicenseRevokedAsync(long licenseId, Guid appId, long revokedAt,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"
                UPDATE licenses
                SET revoked = TRUE,
                    revoked_at = @revokedAt
                WHERE id = @licenseId AND application = @appId
                RETURNING
                    id,
                    value,
                    discordid,
                    max_sessions,
                    email,
                    username,
                    creation_date,
                    activated_at,
                    password,
                    expires_at,
                    paused,
                    activated,
                    application,
                    banned,
                    revoked,
                    revoked_at;";

            var row = await connection.QuerySingleOrDefaultAsync(query, new { licenseId, appId, revokedAt }, transaction);
            return row is null ? null : MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<int> DeleteLicensesForAppAsync(IEnumerable<long> licenseIds, Guid appId,
        IDbTransaction? transaction = null)
    {
        var ids = licenseIds.Distinct().ToArray();
        if (ids.Length == 0) return 0;

        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"DELETE FROM licenses WHERE application = @appId AND id = ANY(@ids);";
            return await connection.ExecuteAsync(query, new { ids, appId }, transaction);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        try
        {
            const string query = @"DELETE FROM licenses WHERE id = @id;";
            var affectedRows = await connection.ExecuteAsync(query, new { id }, transaction);
            return affectedRows > 0;
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<Either<bool, ValidationFailed>> UpdateLicenseListAsync(
        IEnumerable<License> licenses,
        IDbTransaction? transaction = null)
    {
        var connection = await GetConnectionAsync(transaction);
        var ownsTransaction = transaction is null;
        var activeTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            foreach (var license in licenses) await UpdateLicenseAsync(license, activeTransaction);
            if (ownsTransaction) activeTransaction.Commit();
            return true;
        }
        catch
        {
            if (ownsTransaction) activeTransaction.Rollback();
            throw;
        }
        finally
        {
            if (ownsTransaction) activeTransaction.Dispose();
            DisposeIfOwned(connection, transaction);
        }
    }

    public async Task<License?> GetLicenseByUsername(string username)
    {
        var connection = await OpenConnectionAsync();
        try
        {
            var row = await connection.QuerySingleOrDefaultAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE username = @username;",
                new { username });

            return row is null ? null : MapLicense(row);
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<Result<LicenseDto, ValidationFailed>> ActivateLicense(Guid licenseValue, string username,
        string password, string email,
        long discordId,
        IDbTransaction? transaction = null)
    {
        var license = await GetLicenseByValueAsync(licenseValue, transaction);

        if (license == null)
        {
            var error = new ValidationFailure("License", "License activation failed");
            return new ValidationFailed(error);
        }

        if (license.Activated)
        {
            var error = new ValidationFailure("License", "License is already activated");
            return new ValidationFailed(error);
        }

        license.Activated = true;
        license.Username = username;
        license.ActivatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        license.Password = PasswordHashing.HashPassword(password);
        license.DiscordId = discordId;
        license.Email = email;

        license = await UpdateLicenseAsync(license, transaction);

        if (license is null)
        {
            var error = new ValidationFailure("License", "License activation failed");
            return new ValidationFailed(error);
        }

        return license.MapToDto();
    }

    public async Task<Option<IEnumerable<LicenseDto>>> GetLicenseByApplication(Guid application)
    {
        var connection = await OpenConnectionAsync();
        try
        {
            var rows = await connection.QueryAsync(
                $"SELECT {LicenseColumns} FROM licenses WHERE application = @application ORDER BY creation_date DESC;",
                new { application });

            var licenses = new List<LicenseDto>();
            foreach (var row in rows) licenses.Add(MapLicense(row).MapToDto());
            return Option<IEnumerable<LicenseDto>>.Some(licenses);
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<LicenseStats> GetLicenseStatsByTeamAsync(Guid teamId)
    {
        const string sql = @"
            SELECT count(*)::int as Total,
                   (count(*) FILTER (WHERE l.activated AND (l.paused IS NOT TRUE)))::int as Active,
                   (count(*) FILTER (WHERE l.paused IS TRUE))::int as Paused
            FROM licenses l
            JOIN applications a ON l.application = a.id
            WHERE a.team = @TeamId;";

        var connection = await OpenConnectionAsync();
        try
        {
            return await connection.QuerySingleAsync<LicenseStats>(sql, new { TeamId = teamId });
        }
        finally
        {
            connection.Dispose();
        }
    }

    public async Task<IEnumerable<LicensesPerDay>> GetLicensesPerDayByTeamAsync(Guid teamId, int days)
    {
        const string sql = @"
            SELECT to_timestamp(l.creation_date)::date as Date,
                   count(*)::int as Count
            FROM licenses l
            JOIN applications a ON l.application = a.id
            WHERE a.team = @TeamId
              AND to_timestamp(l.creation_date) > now() - make_interval(days => @Days)
            GROUP BY 1
            ORDER BY 1;";

        var connection = await OpenConnectionAsync();
        try
        {
            return await connection.QueryAsync<LicensesPerDay>(sql, new { TeamId = teamId, Days = days });
        }
        finally
        {
            connection.Dispose();
        }
    }

    private async Task<IDbConnection> OpenConnectionAsync()
    {
        return await connectionFactory.CreateConnectionAsync();
    }

    private async Task<IDbConnection> GetConnectionAsync(IDbTransaction? transaction)
    {
        return transaction?.Connection ?? await OpenConnectionAsync();
    }

    private static void DisposeIfOwned(IDbConnection connection, IDbTransaction? transaction)
    {
        if (transaction?.Connection is null) connection.Dispose();
    }

    private static License MapLicense(dynamic row)
    {
        var values = (IDictionary<string, object?>)row;

        return new License
        {
            Id = ToLong(values, "id")!.Value,
            Value = ToGuid(values, "value")!.Value,
            Application = ToGuid(values, "application") ?? Guid.Empty,
            DiscordId = ToLong(values, "discordid"),
            MaxSessions = ToShort(values, "max_sessions") ?? 1,
            Email = ToString(values, "email"),
            Username = ToString(values, "username"),
            CreationDate = DateTimeOffset.FromUnixTimeSeconds(ToLong(values, "creation_date") ?? 0),
            ActivatedAt = ToLong(values, "activated_at"),
            Password = ToString(values, "password"),
            ExpiresAt = ToLong(values, "expires_at") ?? 0,
            Paused = ToBool(values, "paused"),
            Activated = ToBool(values, "activated"),
            Banned = ToBool(values, "banned"),
            Revoked = ToBool(values, "revoked"),
            RevokedAt = ToLong(values, "revoked_at")
        };
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

    private static bool TryCalculateExtendedExpiration(long currentExpiration, int amount, string unit,
        out long newExpiration)
    {
        var current = DateTimeOffset.FromUnixTimeSeconds(currentExpiration);
        var normalizedUnit = unit.Trim().ToLowerInvariant();

        DateTimeOffset updated;
        switch (normalizedUnit)
        {
            case "day":
            case "days":
                updated = current.AddDays(amount);
                break;
            case "month":
            case "months":
                updated = current.AddMonths(amount);
                break;
            case "year":
            case "years":
                updated = current.AddYears(amount);
                break;
            default:
                newExpiration = currentExpiration;
                return false;
        }

        newExpiration = updated.ToUnixTimeSeconds();
        return true;
    }
}

public record LicenseStats(int Total, int Active, int Paused);

public record LicensesPerDay(DateTime Date, int Count);
