using System.Data;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Endpoints.DiscordOperations.RedeemCode;
using Authentication.Models.Entities.Discord;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Licenses;
using Dapper;
using FluentValidation;

namespace Authentication.Services.Discords;

public class DiscordService(
    IValidator<RedeemDiscordCodeDto> validator,
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService,
    ICodeStorageService codeStorageService) : IDiscordService
{
    public async Task<DiscordUser?> CreateUserAsync(ulong discordUserId, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery = @"INSERT INTO discords(discord_id) VALUES (@discordId) RETURNING *;";
        var newUser =
            await connection.QuerySingleAsync<DiscordUser>(addDiscordIdQuery, new { discordUserId }, transaction);

        return newUser;
    }

    public async Task<bool> DeleteUserAsync(ulong id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var addDiscordIdQuery = @"DELETE FROM discords WHERE discord_id = @discordId;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<DiscordUser?> GetByIdAsync(ulong id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM discords WHERE discord_id = @discordId;";

        var discordUser =
            connection.QueryFirstOrDefault<DiscordUser>(getDiscordIdQuery, new { Id = id });
        return discordUser;
    }

    public async Task<Result<bool, ValidationFailed>> ConfirmLicenseRegistrationAsync(
        RedeemDiscordCodeDto discordCode)
    {
        // validate object sent by the user
        var validationResult = await validator.ValidateAsync(discordCode);
        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        // get license from code
        var discordCodeResult = codeStorageService.GetDiscordCode(discordCode.code);
        if (discordCodeResult is null) return false;

        // create Connection
        var connection = await connectionFactory.CreateConnectionAsync();

        // start the transaction
        using var transaction = connection.BeginTransaction();

        var existingDiscordUser = await GetByIdAsync(discordCode.discordId);

        // add discord to database
        if (existingDiscordUser is null)
            await CreateUserAsync(discordCode.discordId, transaction);

        // update redeemed license
        var redeemedLicense = discordCodeResult.License;
        redeemedLicense.Discord = discordCode.discordId;

        // persist changes
        await licenseService.UpdateLicenseAsync(redeemedLicense, transaction);

        // commit transaction
        transaction.Commit();
        return true;
    }
}