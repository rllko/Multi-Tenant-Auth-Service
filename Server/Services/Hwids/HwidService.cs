using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Validators;
using Dapper;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Hwids;

public class HwidService(IValidator<HwidDto> validator, IDbConnectionFactory connectionFactory) : IHwidService
{
    public async Task<Either<Hwid, ValidationFailed>> CreateHwidAsync(HwidDto hwidDto,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var validationResult = await validator.ValidateAsync(hwidDto);

        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        var addDiscordIdQuery =
            @"INSERT INTO hwids(cpu,bios,ram,disk,display) VALUES (@cpu,@bios,@ram,@disk,@display) returning *;";

        return await connection.QuerySingleAsync<Hwid>(addDiscordIdQuery, new { hwidDto }, transaction);
        ;
    }

    public async Task<bool> DeleteLicenseHwidAsync(long id, IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM hwids WHERE id = @id;";
        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { id }, transaction);

        return affectedRows1 > 0;
    }

    public async Task<Hwid> GetHwidByIdAsync(long id)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM hwids WHERE id = @id;";

        var hwid =
            connection.QueryFirst<Hwid>(getDiscordIdQuery, new { id });
        return hwid;
    }

}