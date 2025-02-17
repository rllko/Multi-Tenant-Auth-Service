using System.Data;
using Authentication.Contracts;
using Authentication.Database;
using Authentication.Endpoints;
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
        var connection = await connectionFactory.CreateConnectionAsync();

        var newTransaction = transaction ?? connection.BeginTransaction();

        var licenses = new LicenseDto[amount];
        for (var i = 0; i < amount; i++)
        {
            var license = await CreateLicenseAsync(discordId, null, newTransaction);

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

    public async Task<Result<License, ValidationFailed>> CreateLicenseAsync(long? discordId = null,
        string? email = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

#warning yuh, dont forget to limit this, add a constraint in the db or sm

        var query = @"INSERT INTO public.licenses (discord,email) VALUES (@discord,@email) RETURNING *;";
        var newLicense = await connection.QueryFirstAsync(query, new { discord = discordId, email }, transaction);

        if (newLicense.id == null)
        {
            var error = new ValidationFailure("error", "couldn't create the license");
            return new ValidationFailed(error);
        }

        return new License
        {
            CreationDate = newLicense.creation_date,
            Email = newLicense.email ?? null,
            Value = newLicense.value,
            Discord = newLicense.discord,
            Hw = newLicense.hwid,
            Id = newLicense.id
        };
    }
}