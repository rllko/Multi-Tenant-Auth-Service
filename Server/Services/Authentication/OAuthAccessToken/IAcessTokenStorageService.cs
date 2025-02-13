using Authentication.Models;

namespace Authentication.Services.CodeService;

public interface IAcessTokenStorageService
{
    string? Generate(Guid accessCode);

    AccessToken? GetByCode(Guid accessCode);
    // AuthorizationCodeRequest? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
}