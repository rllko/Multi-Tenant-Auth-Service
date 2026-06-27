using System.Data;
using Authentication.Database;
using Authentication.Endpoints.DiscordOperationEndpoints.RedeemCode;
using Authentication.Models.Entities;
using Authentication.Services.Licenses;
using Dapper;
using FluentValidation;
using FluentValidation.Results;

namespace Authentication.Services.Discords;

public class DiscordService(
    IValidator<RedeemLicenseRequestDto> validator,
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService) : IDiscordService
{
    public async Task<DiscordUser> CreateUserAsync(long discordUserId, IDbTransaction? transaction = null)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery = @"INSERT INTO discords(discord_id) VALUES (@discordUserId) RETURNING *;";

        var newUser =
            await connection.QuerySingleAsync(addDiscordIdQuery, new { discordUserId }, transaction);

        if (newUser == null) throw new Exception($"Could not create user {discordUserId}");

        return new DiscordUser
        {
            DiscordId = newUser.discord_id,
            DateLinked = newUser.date_linked
        };
    }

    public async Task<bool> DeleteUserAsync(ulong id, IDbTransaction? transaction = null)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery = @"DELETE FROM discords WHERE discord_id = @discordId;";

        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<DiscordUser?> GetByIdAsync(long id)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM discords WHERE discord_id = @discordId;";

        var discordUser =
            await connection.QueryFirstOrDefaultAsync(getDiscordIdQuery, new { discordId = id });

        if (discordUser == null) return null;

        return new DiscordUser
        {
            DiscordId = discordUser.discord_id,
            DateLinked = discordUser.date_linked
        };
    }

    public async Task<Result<string, ValidationFailed>> ConfirmLicenseRegistrationAsync(
        RedeemLicenseRequestDto licenseRequest)
    {
        // validate object sent by the user
        var validationResult = await validator.ValidateAsync(licenseRequest);

        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        // create Connection
        using var connection = await connectionFactory.CreateConnectionAsync();

        // start the transaction
        using var transaction = connection.BeginTransaction();

        // add discord to database
        var existingDiscordUser = await GetByIdAsync(licenseRequest.DiscordId) ??
                                  await CreateUserAsync(licenseRequest.DiscordId, transaction);

        // update redeemed license
        var parsedLicense = Guider.ToGuidFromString(licenseRequest.License);
        var redeemedLicense = await licenseService.GetLicenseByValueAsync(parsedLicense);

        if (redeemedLicense is null)
        {
            var error = new ValidationFailure("incorrect fields", "license is invalid");
            transaction.Rollback();

            return new ValidationFailed(error);
        }

        redeemedLicense.DiscordId = existingDiscordUser.DiscordId;
        redeemedLicense.Email = licenseRequest.Email;
        redeemedLicense.Username = licenseRequest.Username;

        var newPassword = PasswordHashing.GenerateRandomPassword();
        redeemedLicense.Password = PasswordHashing.HashPassword(newPassword);
        // persist changes
        var result = await licenseService.UpdateLicenseAsync(redeemedLicense, transaction);

        if (result is null)
        {
            var error = new ValidationFailure("internal error", "cant update the license");
            transaction.Rollback();

            return new ValidationFailed(error);
        }

        // commit transaction
        transaction.Commit();

        return newPassword;
    }
}