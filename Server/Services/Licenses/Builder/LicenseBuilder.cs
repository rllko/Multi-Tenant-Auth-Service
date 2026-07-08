using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Services;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.Licenses.Builder;

public class LicenseBuilder(
    IDbConnectionFactory connectionFactory) : ILicenseBuilder
{
    public Task<Result<License, ValidationFailed>> CreateLicenseAsync(int licenseExpirationInDays,
        long? discordId = null, string? username = null,
        string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        var error = new ValidationFailure("application", "application is required when creating a license");
        return Task.FromResult<Result<License, ValidationFailed>>(new ValidationFailed(error));
    }

    public async Task<Result<License, ValidationFailed>> CreateLicenseAsync(Guid application, int licenseExpirationInDays,
        short? maxSessions = null, long? discordId = null, string? username = null,
        string? email = null, string? password = null, Guid? customValue = null,
        IDbTransaction? transaction = null)
    {
        if (application == Guid.Empty)
        {
            var error = new ValidationFailure("application", "application is required when creating a license");
            return new ValidationFailed(error);
        }

        if (licenseExpirationInDays <= 0)
        {
            var error = new ValidationFailure("expiresInDays", "expiresInDays must be greater than zero");
            return new ValidationFailed(error);
        }

        if (maxSessions is < 0)
        {
            var error = new ValidationFailure("maxSessions", "maxSessions cannot be negative");
            return new ValidationFailed(error);
        }

        var connection = await GetConnectionAsync(transaction);
        try
        {
            var creationDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var expiration = DateTimeOffset.UtcNow.AddDays(licenseExpirationInDays).ToUnixTimeSeconds();
            var hashedPassword = string.IsNullOrWhiteSpace(password) ? null : PasswordHashing.HashPassword(password);
            var activated = !string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(hashedPassword);
            long? activatedAt = activated ? creationDate : null;

            const string query = @"
                INSERT INTO public.licenses
                    (value, discordid, email, username, password, max_sessions, creation_date, expires_at, application, activated, activated_at, paused)
                VALUES
                    (COALESCE(@customValue, gen_random_uuid()), @discordId, @email, @username, @password, @maxSessions, @creationDate, @expiration, @application, @activated, @activatedAt, FALSE)
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

            var row = await connection.QueryFirstOrDefaultAsync(query,
                new
                {
                    discordId,
                    email,
                    username,
                    password = hashedPassword,
                    maxSessions = maxSessions ?? 1,
                    creationDate,
                    expiration,
                    application,
                    activated,
                    activatedAt,
                    customValue
                },
                transaction);

            if (row is null)
            {
                var error = new ValidationFailure("error", "couldn't create the license");
                return new ValidationFailed(error);
            }

            return MapLicense(row);
        }
        finally
        {
            DisposeIfOwned(connection, transaction);
        }
    }

    public Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, int licenseExpirationInDays,
        long? discordId = null, string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        throw new InvalidOperationException("application is required when creating licenses in bulk");
    }

    public async Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(Guid application, int amount, int licenseExpirationInDays,
        short? maxSessions = null, long? discordId = null, string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        if (amount <= 0) return Array.Empty<LicenseDto>();

        var connection = await GetConnectionAsync(transaction);
        var ownsTransaction = transaction is null;
        var activeTransaction = transaction ?? connection.BeginTransaction();

        try
        {
            var licenses = new LicenseDto[amount];
            for (var i = 0; i < amount; i++)
            {
                var license = await CreateLicenseAsync(application, licenseExpirationInDays, maxSessions, discordId,
                    null, email, password, null, activeTransaction);

                license.Match(
                    success => licenses[i] = success.MapToDto(),
                    failed => throw new InvalidOperationException(string.Join(", ", failed.Errors.Select(e => e.ErrorMessage))));
            }

            if (ownsTransaction) activeTransaction.Commit();
            return licenses;
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

    private async Task<IDbConnection> GetConnectionAsync(IDbTransaction? transaction)
    {
        return transaction?.Connection ?? await connectionFactory.CreateConnectionAsync();
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
}
