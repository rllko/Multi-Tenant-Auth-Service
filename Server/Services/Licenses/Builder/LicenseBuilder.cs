using System.Data;
using Authentication.Database;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.Validators;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public class LicenseBuilder(IDbConnectionFactory connectionFactory, IValidator<License> validator) : ILicenseBuilder
{
    public async Task<License> CreateLicenseAsync(long? discordId = null, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "INSERT INTO licenses default values returning *;";
        var newLicense = await connection.QueryFirstAsync<License>(query, transaction: transaction);

        return newLicense;
    }

    public async Task<List<License>> CreateLicenseInBulk(int amount)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transaction = connection.BeginTransaction();

        Span<License> licenses = stackalloc License[amount];
        for (var i = 0; i < amount; i++)
        {
            var license = await CreateLicenseAsync(transaction: transaction);
            licenses[i] = license;
        }
    }

    public async Task<License?> ConfirmLicenseRegistrationAsync(string license, long discord, string? email = null)
    {
        throw new NotImplementedException();
    }

    public async Task<Either<DiscordCode, LicenseValidator.ValidationFailed>> CreateLicenseRegistrationCodeAsync(
        License license)
    {
        throw new NotImplementedException();
    }
}