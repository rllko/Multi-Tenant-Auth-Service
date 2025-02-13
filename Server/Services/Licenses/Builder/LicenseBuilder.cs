using System.Data;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using Authentication.Services.Authentication.CodeStorage;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Licenses.Builder;

public class LicenseBuilder(
    IDbConnectionFactory connectionFactory,
    IValidator<License> validator,
    ICodeStorageService codeStorageService) : ILicenseBuilder
{
    public async Task<Either<bool, ValidationFailed>> CreateLicenseRegistrationCodeAsync(
        License license)
    {
        // validate object sent by the user
        var validationResult = await validator.ValidateAsync(license);
        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        // get license from code
        var discordCodeResult = codeStorageService.CreateDiscordCodeAsync(license);

        return true;
    }

    public async Task<License> CreateLicenseAsync(ulong? discordId = null, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query =
            $"INSERT INTO public.licenses {(discordId is null ? "(discord)" : "")} VALUES {discordId} RETURNING *;";
        var newLicense = await connection.QueryFirstAsync<License>(query, transaction: transaction);

        return newLicense;
    }

    public async Task<IEnumerable<License>> CreateLicenseInBulk(int amount, ulong? discordId = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transaction = connection.BeginTransaction();

        var licenses = new License[amount];
        for (var i = 0; i < amount; i++)
        {
            var license = await CreateLicenseAsync(discordId, transaction);
            licenses[i] = license;
        }

        transaction.Commit();

        return licenses.AsEnumerable();
    }
}