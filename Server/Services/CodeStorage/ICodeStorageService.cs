using Authentication.Models;
using Authentication.Models.Context;

namespace Authentication.Services.CodeService;

public interface ICodeStorageService
{
    string? CreateAuthorizationCode(AuthenticationDbContext _dbcontext, string? clientId,
        AuthorizationCode authorizationCode);

    string? CreateDiscordCode(AuthenticationDbContext _dbContext, string license);
    AuthorizationCode? GetClientByCode(string key);
    DiscordCode? GetUserByCode(string code);
    bool RemoveClientByCode(Guid key);
}