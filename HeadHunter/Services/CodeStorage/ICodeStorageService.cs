using HeadHunter.Models;
using HeadHunter.Models.Context;

namespace HeadHunter.Services.CodeService
{
    public interface ICodeStorageService
    {
        string? CreateAuthorizationCode(HeadhunterDbContext _dbcontext, string clientId, AuthorizationCode authorizationCode);
        AuthorizationCode? GetClientByCode(string key);
        //AuthorizationCode? UpdatedClientByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
        AuthorizationCode? RemoveClientByCode(string key);
    }
}
