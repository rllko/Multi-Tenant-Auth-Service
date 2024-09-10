using HeadHunter.Models;
using HeadHunter.Models.Context;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace HeadHunter.Services.CodeService;

public class CodeStorageService : ICodeStorageService
{
    private readonly ConcurrentDictionary<string, AuthorizationCode> _codeIssued = new();

    //private readonly InMemoryClientDatabase _clientStore = new();

    // Here I genrate the code for authorization, and I will store it 
    // in the Concurrent Dictionary, PKCE

    public CodeStorageService()
    {
    }

    public string? GenerateCode(HeadhunterDbContext _dbContext, string clientIdentifier, AuthorizationCode authorizationCode)
    {
        var client = _dbContext.Clients.Where(x => x.ClientIdentifier == clientIdentifier).FirstOrDefault();

        if(client is null)
        {
            return null;
        }

        var code = Guid.NewGuid().ToString();

        // then store the code is the Concurrent Dictionary
        _codeIssued [code] = authorizationCode;

        return code;
    }

    public AuthorizationCode? GetClientByCode(string key)
    {
        if(_codeIssued.TryGetValue(key, out AuthorizationCode? authorizationCode))
        {
            return authorizationCode;
        }
        return null;
    }

    public AuthorizationCode? RemoveClientByCode(string key)
    {
        _codeIssued.TryRemove(key, value: out AuthorizationCode? authorizationCode);
        return null;
    }

    // TODO
    // Before updated the Concurrent Dictionary I have to Process User Sign In,
    // and check the user credienail first
    // But here I merge this process here inside update Concurrent Dictionary method
    public AuthorizationCode? UpdatedClientByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes)
    {
        //var oldValue = GetClientByCode(key);

        //if(oldValue != null)
        //{
        //    // check the requested scopes with the one that are stored in the Client Store 
        //    var client = _dbContext.Clients.Where(x => x.ClientIdentifier == oldValue.ClientIdentifier).FirstOrDefault();

        //    if(client != null)
        //    {
        //        var clientScope = (from m in client.Scopes
        //                           where requestdScopes.Contains(m.ScopeName)
        //                           select m).ToList();

        //        if(clientScope.Count == 0)
        //            return null;

        //        AuthorizationCode newValue = new()
        //        {
        //            ClientIdentifier = oldValue.ClientIdentifier,
        //            CreationTime = oldValue.CreationTime,
        //            IsOpenId = requestdScopes.Contains("openid",StringComparer.OrdinalIgnoreCase) || requestdScopes.Contains("profile"),
        //            RedirectUri = oldValue.RedirectUri,
        //            RequestedScopes = requestdScopes,
        //            Nonce = oldValue.Nonce,
        //            CodeChallenge = oldValue.CodeChallenge,
        //            CodeChallengeMethod = oldValue.CodeChallengeMethod
        //        };

        //        var result = _codeIssued.TryUpdate(key, newValue, oldValue);

        //        if(result)
        //            return newValue;
        //        return null;
        //    }
        //}
        return null;
    }

    public AuthorizationCode? UpdatedClientDataByCode(string key, IList<string> requestdScopes,
         string? nonce = null)
    {
        //var oldValue = GetClientByCode(key);

        //if(oldValue != null)
        //{
        //    // check the requested scopes with the one that are stored in the Client Store 
        //    var client = _dbContext.Clients.Where(x => x.ClientIdentifier == oldValue.ClientIdentifier).FirstOrDefault();

        //    if(client != null)
        //    {
        //        var clientScope = (from m in client.Scopes
        //                           where requestdScopes.Contains(m.ScopeName)
        //                           select m).ToList();



        //        if(clientScope.Count == 0)
        //            return null;

        //        AuthorizationCode newValue = new()
        //        {
        //            ClientIdentifier = oldValue.ClientIdentifier,
        //            CreationTime = oldValue.CreationTime,
        //            IsOpenId = requestdScopes.Contains("openid") || requestdScopes.Contains("profile"),
        //            RedirectUri = oldValue.RedirectUri,
        //            RequestedScopes = requestdScopes,
        //            Nonce = nonce ?? oldValue.Nonce,
        //        };


        //        // ------------------ I suppose the user name and password is correct  -----------------
        //        var claims = new List<Claim>();



        //        if(newValue.IsOpenId)
        //        {
        //            // TODO
        //            // Add more claims to the claims

        //        }

        //        //var claimIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        //        //newValue.Subject = new Client();
        //        // ------------------ -----------------------------------------------  -----------------

        //        var result = _codeIssued.TryUpdate(key, newValue, oldValue);

        //        if(result)
        //            return newValue;
        //        return null;
        //    }
        //}
        return null;
    }
}