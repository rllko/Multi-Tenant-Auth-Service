using System.Data;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Licenses;

public class LicenseService(IDbConnectionFactory connectionFactory) : ILicenseService
{
    public async Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE discord = @discordId;";

        var licenseList = await
            connection.QueryAsync<License>(getDiscordIdQuery, new { discordId });
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

    public async Task<License?> GetLicenseByValueAsync(Guid licenseValue)
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

    /// <summary>
    ///     Update discord most likely
    /// </summary>
    /// <param name="license"></param>
    /// <param name="transaction"></param>
    /// <returns></returns>
    public async Task<License?> UpdateLicenseAsync(License license,
        IDbTransaction? transaction = null)
    {
// #warning here, add license validator
//         var validationResult = await validator.ValidateAsync(license);
//         if (!validationResult.IsValid) return null;

        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery =
            @"UPDATE licenses
	        SET discord = @Discord WHERE id = @SessionId returning *";

        var updatedLicense =
            await connection.QuerySingleAsync<License>(addDiscordIdQuery, new { license }, transaction);
        return updatedLicense;
    }

    public async Task<bool> DeleteLicenseAsync(long id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM public.licenses WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<Either<bool, ValidationFailed>> UpdateLicenseListAsync(
        IEnumerable<License> licenses,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var transactional = transaction ?? connection.BeginTransaction();
        // yikes, improve later
        foreach (var license in licenses) await UpdateLicenseAsync(license, transactional);

        return true;
    }
}