using Authentication.Abstracts.Persistence;
using Authentication.Models.Entities;
using Dapper;

namespace Authentication.Repositories.DiscordRepository;

public class DiscordRepository : IDiscordRepository
{
    private readonly DapperContext _context;

    public DiscordRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DiscordUser>> GetUsers()
    {
        var query = "select * from discords";
        await using var connection = _context.GetConnection();

        return await connection.QueryAsync<DiscordUser>(query);
    }

    public async Task<DiscordUser> GetUser(string id)
    {
        throw new NotImplementedException();
    }

    public async Task<int> AddUser(DiscordUser user)
    {
        throw new NotImplementedException();
    }
}