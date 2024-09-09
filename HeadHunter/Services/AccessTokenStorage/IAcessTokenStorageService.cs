using HeadHunter.Models;

namespace HeadHunter.Services.CodeService
{
    public interface IAcessTokenStorageService
    {
        string? Generate(string code);
        AuthorizationCode? GetByCode(string code);
        // AuthorizationCode? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
        AuthorizationCode? RemoveClientByCode(string key);
    }
}
