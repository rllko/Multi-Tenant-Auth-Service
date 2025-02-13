using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Validators;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public class LicenseBuilder(
    IDbConnectionFactory connectionFactory,
    IValidator<License> validator,
    ICodeStorageService codeStorageService) : ILicenseBuilder
{
    public async Task<IEnumerable<string>> CreateLicenseInBulk(int amount)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transaction = connection.BeginTransaction();

        var licenses = new string[amount];
        for (var i = 0; i < amount; i++)
        {
            var license = await CreateLicenseAsync(transaction: transaction);
            licenses[i] = license.Value.ToString();
        }

        transaction.Commit();

        return licenses.AsEnumerable();
    }

    public async Task<Either<bool, ValidationFailed>> CreateLicenseRegistrationCodeAsync(
        License license)
    {
        // validate object sent by the user
        var validationResult = await validator.ValidateAsync(license);
        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        // get license from code
        var discordCodeResult = codeStorageService.CreateDiscordCodeAsync(license.Id);
        if (discordCodeResult is null) return false;

        return true;
    }

    public async Task<License> CreateLicenseAsync(long? discordId = null, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "INSERT INTO licenses default values returning *;";
        var newLicense = await connection.QueryFirstAsync<License>(query, transaction: transaction);

        return newLicense;
    }
}