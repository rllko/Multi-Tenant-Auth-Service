using System.Data;
using Authentication.Contracts;
using Authentication.Database;
using Authentication.Models.Entities;
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