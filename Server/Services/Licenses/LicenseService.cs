using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using FluentValidation.Results;
using LanguageExt;

namespace Authentication.Services.Licenses;

public class LicenseService(IDbConnectionFactory connectionFactory) : ILicenseService
{
    public async Task<IEnumerable<License>> GetLicensesByDiscordId(long discordId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery =
            @"SELECT l.* FROM licenses l 
            WHERE discordid = @discordId;";

        var licenseList = await
            connection.QueryAsync<dynamic>(getDiscordIdQuery, new { discordId });

        return licenseList.Select(x => new License
        {
            Id = x.id,
            Value = x.value,
            DiscordId = x.discordid,
            MaxSessions = x.max_sessions,
            Email = x.email,
            Username = x.username,
            CreationDate = x.creation_date is not null
                ? DateTimeOffset.FromUnixTimeSeconds(x.creation_date)
                : null,
            ActivatedAt = x.activated_at is not null ? x.activated_at : null,
            Password = x.password,
            ExpiresAt = x.expires_at,
            Paused = x.paused,
            Activated = x.activated
        }).ToList();
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
            CreationDate = x.creation_date is not null
                ? DateTimeOffset.FromUnixTimeSeconds(x.creation_date)
                : null,
            ActivatedAt = x.activated_at is not null ? x.actvated_at : null,
            Password = x.password,
            ExpiresAt = x.expires_at,
            Paused = x.paused,
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

        var query = @"
            UPDATE Licenses
            SET 
                password = @Password,
                username = @Username,
                discordid = @DiscordId,
                email = @Email,
                paused = @Paused,
                activated = @Activated,
                activated_at = @ActivatedAt
            WHERE id = @Id returning *";


        var updatedLicense =
            await connection.QuerySingleAsync<License>(query, new
            {
                license.Password,
                license.Username,
                license.DiscordId,
                license.Email,
                license.Paused,
                license.Activated,
                license.ActivatedAt,
                license.Id
            }, transaction);
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

    public async Task<License?> GetLicenseByUsername(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
#warning start here!
        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE username = @username;";

        var x = await
            connection.QuerySingleOrDefaultAsync(getDiscordIdQuery, new { username });

        var license = new License
        {
            Id = x.id,
            Value = x.value,
            DiscordId = x.discordid,
            MaxSessions = x.max_sessions,
            Email = x.email,
            Username = x.username,
            CreationDate = x.creation_date is not null
                ? DateTimeOffset.FromUnixTimeSeconds(x.creation_date)
                : null,
            ActivatedAt = x.activated_at is not null ? x.actvated_at : null,
            Password = x.password,
            ExpiresAt = x.expires_at,
            Paused = x.paused,
            Activated = x.activated
        };

        return license;
    }

    public async Task<Result<LicenseDto, ValidationFailed>> ActivateLicense(Guid licenseValue, string username,
        string password, string email,
        long discordId,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM licenses WHERE value = @licenseValue;";

        var license = await
            connection.QuerySingleOrDefaultAsync<License>(getDiscordIdQuery, new { licenseValue });

        if (license == null)
        {
            var error = new ValidationFailure("License", "License activation failed");
            return new ValidationFailed(error);
        }

        if (license.Activated)
        {
            var error = new ValidationFailure("License", "License is already activated");
            return new ValidationFailed(error);
        }

        license.Activated = true;
        license.Username = username;
        license.ActivatedAt = DateTimeOffset.Now.ToUnixTimeSeconds();
        license.Password = PasswordHashing.HashPassword(password);
        license.DiscordId = discordId;
        license.Email = email;

        license = await UpdateLicenseAsync(license);

        if (license is null)
        {
            var error = new ValidationFailure("License", "License activation failed");
            return new ValidationFailed(error);
        }

        return license.MapToDto();
    }


    // Start/resume license


    // Pause license and update remaining time
}