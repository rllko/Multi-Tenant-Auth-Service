using System.Data;
using Authentication.Contracts;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using Authentication.Services.Authentication.CodeStorage;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.Licenses.Builder;

public class LicenseBuilder(
    IDbConnectionFactory connectionFactory,
    ICodeStorageService codeStorageService) : ILicenseBuilder
{
    public async Task<IEnumerable<LicenseDto>> CreateLicenseInBulk(int amount, long? discordId = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var newtransaction = transaction ?? connection.BeginTransaction();

        var licenses = new LicenseDto[amount];
        for (var i = 0; i < amount; i++)
        {
            var license = await CreateLicenseAsync(discordId, null, newtransaction);

            license.Match(s => licenses[i] = s.MapToDto(),
                failed =>
                {
                    newtransaction.Rollback();
                    throw new Exception($"Failed to create license for {license}");
                }
            );
        }

        newtransaction.Commit();

        return licenses.AsEnumerable();
    }

    public async Task<Result<License, ValidationFailed>> CreateLicenseAsync(long? discordId = null,
        string? email = null,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "";
        dynamic newLicense;

#warning yuh, dont forget to limit this, add a constraint in the db or sm
        if (discordId is not null || email is not null)
        {
            query = @"INSERT INTO public.licenses (discord,email) VALUES (@discord,@email) RETURNING *;";
            newLicense = await connection.QueryFirstAsync(query!, new { discord = discordId, email }, transaction);
        }
        else
        {
            query = @"INSERT INTO public.licenses default values RETURNING *;";
            newLicense = await connection.QueryFirstAsync(query!, transaction: transaction);
        }

        if (newLicense == null)
        {
            var error = new ValidationFailure("error", "couldnt create the license");
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