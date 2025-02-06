using Authentication.Models;

namespace Authentication.Services.CodeService;

public interface ICodeStorageService
{
    string? CreateAuthorizationCode(string? clientId,
        AuthorizationCode authorizationCode);

    string? CreateDiscordCode(string license);
    AuthorizationCode? GetClientByCode(string key);
    DiscordCode? GetUserByCode(string code);
    bool RemoveClientByCode(Guid key);
}