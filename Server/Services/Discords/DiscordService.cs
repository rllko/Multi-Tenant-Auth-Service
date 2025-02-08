using Authentication.Database;
using Authentication.Models.Entities.Discord;
using Authentication.Validators;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Discords;

public class DiscordService(IValidator<DiscordCode> validator, IDbConnectionFactory connectionFactory) : IDiscordService
{
    public async Task<DiscordUser?> GetDiscordFromLicenseAsync(long licenceId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
    }

    public async Task<bool> UpdateLicenseOwnershipAsync(long oldId, long newId)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
    }

    public async Task<bool> DeleteDiscordUserAsync(long id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
    }

    public async Task<Either<bool, ValidationFailed>> ConfirmLicenseRegistrationAsync(DiscordCode discordCode)
    {
        var validationResult = await validator.ValidateAsync(discordCode);

        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        var connection = await connectionFactory.CreateConnectionAsync();

        var result = await connection.ExecuteAsync("query");

        return result is not 0;
    }
}