using Authentication.Models;
using DiscordCode = Authentication.Models.Entities.Discord.DiscordCode;

namespace Authentication.Services.Authentication.CodeStorage;

public interface ICodeStorageService
{
    string? CreateAuthorizationCode(AuthorizationCodeRequest authorizationCodeRequest);

    string? CreateDiscordCode(long license);
    AuthorizationCodeRequest? GetClientByCode(string key);
    DiscordCode? GetUserByCode(string code);
    bool RemoveClientByCode(Guid key);
}