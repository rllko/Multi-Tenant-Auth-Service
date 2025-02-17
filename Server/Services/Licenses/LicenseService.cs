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

        var getDiscordIdQuery =
            @"SELECT l.*,d.*,l.max_sessions as MaxSessions FROM licenses l 
            inner join public.discords d 
            on d.discord_id = l.discordid 
            WHERE discordid = @discordId;";

        var licenseList = await
            connection.QueryAsync<dynamic, dynamic, License>(getDiscordIdQuery, (x, user) =>
                new License
                {
                    Value = x.value,
                    DiscordId = x.discordid,
                    MaxSessions = x.max_sessions,
                    Email = x.email,
                    Username = x.username,
                    CreationDate = x.creation_date,
                    Password = x.password,
                    ExpirationDate = x.expiration_date,
                    Activated = x.activated
                }, discordId, splitOn: "discord_id");
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

        await using var multi = await connection.QueryMultipleAsync(getDiscordIdQuery);

        // Custom mapping
        var licenses = (await multi.ReadAsync<dynamic>()).Select(x => new License
        {
            Id = x.id,
            Value = x.value,
            DiscordId = x.discordid,
            MaxSessions = x.max_sessions,
            Email = x.email,
            Username = x.username,
            CreationDate = x.creation_date,
            Password = x.password,
            ExpirationDate = x.expiration_date,
            Activated = x.activated
        }).ToList();
        return licenses;
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
	        SET discordid = @DiscordId WHERE id = @SessionId returning *";

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

    public async Task<License?> GetLicenseByUsernameWithDiscordAsync(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE username = @username;";

        var license = await
            connection.QuerySingleOrDefaultAsync<License>(getDiscordIdQuery, new { licenseValue = username });
        return license;
    }

    public async Task<long> GetRemainingTime(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT 
                CASE 
                    WHEN activated THEN RemainingSeconds - EXTRACT(EPOCH FROM (NOW() - LastStartedAt)) 
                    ELSE RemainingSeconds 
                END AS TimeLeft
            FROM Licenses
            WHERE username = @username;
        ";

        return await connection.ExecuteScalarAsync<long>(query, new { username });
    }

    // Start/resume license
    public async Task ResumeLicense(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            UPDATE Licenses
            SET LastStartedAt = NOW(), activated = TRUE
            WHERE username = @username;
        ";

        await connection.ExecuteAsync(query, new { username });
    }

    // Pause license and update remaining time
    public async Task PauseLicense(Guid username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            UPDATE Licenses
            SET RemainingSeconds = RemainingSeconds - EXTRACT(EPOCH FROM (NOW() - LastStartedAt)),
                LastStartedAt = NULL,
                activated = FALSE
            WHERE username = @username AND activated = TRUE;
        ";

        await connection.ExecuteAsync(query, new { username });
    }
}