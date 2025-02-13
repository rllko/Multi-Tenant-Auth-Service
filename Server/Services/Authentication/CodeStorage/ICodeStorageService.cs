using Authentication.Models;

namespace Authentication.Services.Authentication.CodeStorage;

public interface ICodeStorageService
{
    Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest);

    Task<string?> CreateDiscordCodeAsync(long license);
    AuthorizationCodeRequest? GetClientByCode(string? key);
    DiscordCode? GetDiscordCode(string code);
}