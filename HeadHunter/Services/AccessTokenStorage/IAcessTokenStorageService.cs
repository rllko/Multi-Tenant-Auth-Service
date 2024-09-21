using HeadHunter.Models;

namespace HeadHunter.Services.CodeService
{
    public interface IAcessTokenStorageService
    {
        string? Generate(Guid accessCode);
        AccessToken? GetByCode(Guid accessCode);
        // AuthorizationCode? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
    }
}
