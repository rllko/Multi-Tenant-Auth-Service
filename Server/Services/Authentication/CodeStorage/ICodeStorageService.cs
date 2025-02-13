using Authentication.Models;
using Authentication.Models.Entities;

namespace Authentication.Services.Authentication.CodeStorage;

public interface ICodeStorageService
{
    Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest);

    string CreateDiscordCodeAsync(License license);
    AuthorizationCodeRequest? GetClientByCode(string? key);
    DiscordCode? GetDiscordCode(string code);
}