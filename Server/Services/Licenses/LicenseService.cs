using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Validators;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Licenses;

public class LicenseService(IValidator<License> validator, IDbConnectionFactory connectionFactory) : ILicenseService
{
    public async Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE discord = @discordId;";

        var licenseList = await
            connection.QueryAsync<License>(getDiscordIdQuery, new { Id = discordId });
        return licenseList;
    }

    public async Task<License?> GetLicenseByIdAsync(long licenseId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE id = @licenseId;";

        var license = await
            connection.QuerySingleOrDefaultAsync<License>(getDiscordIdQuery, new { licenseId });
        return license;
    }

    public async Task<License?> GetLicenseByValueAsync(long licenseValue)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE value = @licenseValue;";

        var license = await
            connection.QuerySingleOrDefaultAsync<License>(getDiscordIdQuery, new { licenseValue });
        return license;
    }

    public async Task<License?> GetLicenseByCreationDateAsync(DateTime date)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE creation_date = @date;";

        var license = await
            connection.QuerySingleOrDefaultAsync<License>(getDiscordIdQuery, new { date });
        return license;
    }

    public async Task<IEnumerable<License>> GetAllLicensesAsync()
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses;";

        var license = await
            connection.QueryAsync<License>(getDiscordIdQuery);
        return license;
    }

    // genuinely i dont know why we would use this, the only thing that you can change is discord :shrug:
    public async Task<Either<License, ValidationFailed>> UpdateLicenseAsync(License license,
        IDbTransaction? transaction = null)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM public.licenses WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<bool> UpdateLicenseListAsync(
        ulong oldDiscordId,
        List<License> licenses,
        ulong? newDiscordId = null,
        IDbTransaction? transaction = null)
    {
#warning remember to finish this

        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM public.licenses WHERE id = @id;";
        // var affectedRows1 =
        //   await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);
        return true;
        //return affectedRows1 > 0;
    }
}