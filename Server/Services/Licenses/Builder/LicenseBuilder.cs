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
    public async Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, long? discordId = null,
        IDbTransaction? transaction = null)
    {
        throw new NotImplementedException();
    }

    public async Task<Result<License, ValidationFailed>> CreateLicenseAsync(int licenseExpirationInDays,
        long? discordId = null, string? username = null,
        string? email = null, string? password = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
        var expiration = DateTime.Now.AddDays(licenseExpirationInDays);

        var query =
            @"INSERT INTO public.licenses (discordId,email,username,remaining_seconds,password) VALUES (@discord,@email,@username,@expiration,@password) RETURNING *;";
#warning dont forget to do turn into seconds the days picked for the license
        var ye = new object[] { discordId, email, password, username }.Count(x => x == null) is not 0 or 4;
        if (ye)
        {
            var error = new ValidationFailure("error", "discordId, email and password must be provided");
            return new ValidationFailed(error);
        }

        var originalPassword = password ?? PasswordHashing.GenerateRandomPassword();
        password = PasswordHashing.HashPassword(originalPassword);

        var newLicense =
            await connection.QueryFirstAsync(query, new { discord = discordId, email, username, expiration, password },
                transaction);

        if (newLicense.id == null)
        {
            var error = new ValidationFailure("error", "couldn't create the license");
            return new ValidationFailed(error);
        }

        return new License
        {
            ExpirationDate = newLicense.expiration_date,
            CreationDate = newLicense.creation_date,
            Password = originalPassword,
            Email = newLicense.email ?? null,
            Value = newLicense.value,
            Discord = newLicense.discord,
            Id = newLicense.id
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