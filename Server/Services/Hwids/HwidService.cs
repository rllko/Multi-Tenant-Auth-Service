using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;

namespace Authentication.Services.Hwids;

public class HwidService(IDbConnectionFactory connectionFactory) : IHwidService
{
    public async Task<Hwid?> CreateHwidAsync(HwidDto hwidDto,
        IDbTransaction? transaction = null)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        //var validationResult = await validator.ValidateAsync(hwidDto);

        //if (validationResult.IsValid is false) return null;

        var addDiscordIdQuery =
            @"INSERT INTO hwids(cpu,bios,ram,disk,display) VALUES (@cpu,@bios,@ram,@disk,@display) returning *;";

        return await connection.QuerySingleOrDefaultAsync<Hwid>(addDiscordIdQuery, new { hwidDto }, transaction);
        ;
    }


    public async Task<bool> DeleteHwidAsync(long id, IDbTransaction? transaction = null)
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

    public async Task<Hwid?> GetHwidByDtoAsync(HwidDto hwidDto)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        //var validationResult = await validator.ValidateAsync(hwidDto);

        //if (validationResult.IsValid is false) return null;

        const string query =
            @"SELECT * FROM hwids WHERE cpu = @cpu and bios = @bios and ram = @ram AND disk = @disk AND display = @display;";
        var results = await connection.QueryAsync(query);

        return results.Select(x => new Hwid
        {
            Id = x.Id,
            Cpu = x.cpu,
            Bios = x.bios,
            Ram = x.ram,
            Disk = x.disk,
            Display = x.display
        }).FirstOrDefault();
    }

    /// <summary>
    ///     HASHES 1 and 2 must NEVER change. If they do its a new person
    ///     Hashes 3 4 and 5 can change, but only one of them can change,
    ///     if more than one of these changes then its a new person.
    ///     Gets 1 and 2, and returns all similar hwids
    ///     check 3 ,4 or 5 for changes
    /// </summary>
    /// <param name="hwidDto">Hwid to check</param>
    /// <returns>a valid hwid</returns>
    /// <exception cref="NotImplementedException"></exception>
    public async Task<IEnumerable<Hwid>> GetHwidsByDtoAsync(HwidDto hwidDto)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        //var validationResult = await validator.ValidateAsync(hwidDto);

        //if (validationResult.IsValid is false) return null;

        const string query = @"SELECT * FROM hwids WHERE cpu = @cpu and bios = @bios;";
        var results = await connection.QueryMultipleAsync(query);

        var hwids = await results.ReadAsync<Hwid>();
        return hwids.ToList();
    }
}