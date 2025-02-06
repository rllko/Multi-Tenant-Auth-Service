using Authentication.Models.Entities;

namespace Authentication.Repositories.DiscordRepository;

public interface IDiscordRepository
{
    public Task<IEnumerable<DiscordUser>> GetUsers();
    public Task<DiscordUser> GetUser(string id);
    public Task<int> AddUser(DiscordUser user);
}