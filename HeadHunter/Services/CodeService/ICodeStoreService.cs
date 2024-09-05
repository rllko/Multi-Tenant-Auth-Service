using HeadHunter.Models;
using System.Security.Claims;

namespace HeadHunter.Services.CodeService
{
    public interface ICodeStoreService
    {
        string GenerateAuthorizationCode(string clientId, AuthorizationCode authorizationCode);
        AuthorizationCode GetClientDataByCode(string key);
        AuthorizationCode UpdatedClientDataByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
        AuthorizationCode RemoveClientDataByCode(string key);
    }
}
