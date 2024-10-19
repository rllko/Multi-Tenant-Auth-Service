using HeadHunter.Models;
using HeadHunter.Models.Context;

namespace HeadHunter.Services.CodeService
{
    public interface ICodeStorageService
    {
        string? CreateAuthorizationCode(HeadhunterDbContext _dbcontext, string? clientId, AuthorizationCode authorizationCode);
        string? CreateDiscordCode(HeadhunterDbContext _dbContext, string license);
        AuthorizationCode? GetClientByCode(string key);
        DiscordCode? GetUserByCode(string code);
        bool RemoveClientByCode(Guid key);
    }
}
