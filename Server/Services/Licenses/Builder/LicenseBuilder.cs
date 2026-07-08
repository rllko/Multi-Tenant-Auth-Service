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
    public async Task<Result<License, ValidationFailed>> CreateLicenseAsync(int licenseExpirationInDays,
        long? discordId = null, string? username = null,
        string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
        var creationDate = DateTimeOffset.Now.ToUnixTimeSeconds();
        var expiration = DateTimeOffset.Now.AddDays(licenseExpirationInDays).ToUnixTimeSeconds();

        var query =
            @"INSERT INTO public.licenses (discordId,email,username,creation_date,expires_at) VALUES (@discord,@email,@username,@creationDate,@expiration) RETURNING *;
        ";

        var ye = new object?[] { discordId, email, username }.Count(x => x == null) is 4;
        if (ye)
        {
            var error = new ValidationFailure("error", "discordId, email and password must be provided");
            return new ValidationFailed(error);
        }


        var newLicense =
            await connection.QueryFirstAsync(query,
                new { discord = discordId, email, username, creationDate, expiration },
                transaction);

        if (newLicense.id == null)
        {
            var error = new ValidationFailure("error", "couldn't create the license");
            return new ValidationFailed(error);
        }

        return new License
        {
            CreationDate = DateTimeOffset.FromUnixTimeSeconds(newLicense.creation_date),
            Value = newLicense.value,
            Id = newLicense.id,
            ExpiresAt = newLicense.expires_at,
            Email = newLicense.email ?? null,
            Discord = newLicense.discord ?? null
        };
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

        var connection = await connectionFactory.CreateConnectionAsync();
        var creationDate = DateTimeOffset.Now.ToUnixTimeSeconds();
        var expiration = DateTimeOffset.Now.AddDays(licenseExpirationInDays).ToUnixTimeSeconds();
        var hashedPassword = string.IsNullOrWhiteSpace(password) ? null : PasswordHashing.HashPassword(password);
        var activated = !string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(hashedPassword);
        long? activatedAt = activated ? creationDate : null;

        var query =
            @"INSERT INTO public.licenses
                (value, discordid, email, username, password, max_sessions, creation_date, expires_at, application, activated, activated_at, paused)
              VALUES
                (COALESCE(@customValue, gen_random_uuid()), @discord, @email, @username, @password, @maxSessions, @creationDate, @expiration, @application, @activated, @activatedAt, FALSE)
              RETURNING *;";

        var newLicense =
            await connection.QueryFirstAsync(query,
                new
                {
                    customValue,
                    discord = discordId,
                    email,
                    username,
                    password = hashedPassword,
                    maxSessions = maxSessions ?? 1,
                    creationDate,
                    expiration,
                    application,
                    activated,
                    activatedAt
                },
                transaction);

        if (newLicense.id == null)
        {
            var error = new ValidationFailure("error", "couldn't create the license");
            return new ValidationFailed(error);
        }

        return new License
        {
            CreationDate = DateTimeOffset.FromUnixTimeSeconds(newLicense.creation_date),
            Value = newLicense.value,
            Id = newLicense.id,
            ExpiresAt = newLicense.expires_at,
            Email = newLicense.email ?? null,
            Username = newLicense.username ?? null,
            Password = newLicense.password ?? null,
            DiscordId = newLicense.discordid ?? null,
            MaxSessions = newLicense.max_sessions == null ? (short)1 : Convert.ToInt16(newLicense.max_sessions),
            Application = newLicense.application,
            Activated = newLicense.activated ?? false,
            ActivatedAt = newLicense.activated_at ?? null,
            Paused = newLicense.paused ?? false,
            Banned = newLicense.banned ?? false,
            Revoked = newLicense.revoked ?? false,
            RevokedAt = newLicense.revoked_at ?? null
        };
    }

    public async Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, int licenseExpirationInDays,
        long? discordId = null, string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var newTransaction = transaction ?? connection.BeginTransaction();

        var licenses = new LicenseDto[amount];
        for (var i = 0; i < amount; i++)
        {
            var license =
                await CreateLicenseAsync(licenseExpirationInDays, discordId, email, password, password, newTransaction);

            license.Match(s => licenses[i] = s.MapToDto(),
                failed =>
                {
                    newTransaction.Rollback();
                    throw new Exception(failed.Errors.ToString());
                }
            );
        }

        newTransaction.Commit();

        return licenses.AsEnumerable();
    }
}
