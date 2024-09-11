using HeadHunter.Models;

namespace HeadHunter.Services.CodeService
{
    public interface IAcessTokenStorageService
    {
        string? Generate(string code);
        AccessToken? GetByCode(string code);
        // AuthorizationCode? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
        bool RemoveClientByCode(string key);
    }
}
