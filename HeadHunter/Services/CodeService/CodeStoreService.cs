using HeadHunter.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Text;

namespace HeadHunter.Services.CodeService;

public class CodeStoreService : ICodeStoreService
{
    private readonly ConcurrentDictionary<string, AuthorizationCode> _codeIssued = new();
    private readonly ClientStore _clientStore = new();

    // Here I genrate the code for authorization, and I will store it 
    // in the Concurrent Dictionary, PKCE

    public string? GenerateAuthorizationCode(string clientId, AuthorizationCode authorizationCode)
    {
        var client = _clientStore.Clients.Where(x => x.Clientid == clientId).FirstOrDefault();

        if(client is null)
        {
            return null;
        }

        var code = Base64UrlEncoder.Encode(Encoding.ASCII.GetBytes(Guid.NewGuid().ToString()));

        // then store the code is the Concurrent Dictionary
        _codeIssued [code] = authorizationCode;

        return code;
    }

    public string? GenerateAuthorizationCode(AuthorizationCode authorizationCode)
    {
        var client = _clientStore.Clients.Where(x => x.Clientid == authorizationCode.ClientId).SingleOrDefault();

        if(client != null)
        {
            var code = Base64UrlEncoder.Encode(Encoding.ASCII.GetBytes(Guid.NewGuid().ToString()));
            _codeIssued [code] = authorizationCode;

            return code;
        }
        return null;
    }

    public AuthorizationCode? GetClientDataByCode(string key)
    {
        if(_codeIssued.TryGetValue(key, out AuthorizationCode? authorizationCode))
        {
            return authorizationCode;
        }
        return null;
    }

    public AuthorizationCode? RemoveClientDataByCode(string key)
    {
        _codeIssued.TryRemove(key, value: out AuthorizationCode? authorizationCode);
        return null;
    }

    // TODO
    // Before updated the Concurrent Dictionary I have to Process User Sign In,
    // and check the user credienail first
    // But here I merge this process here inside update Concurrent Dictionary method
    public AuthorizationCode? UpdatedClientDataByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes)
    {
        var oldValue = GetClientDataByCode(key);

        if(oldValue != null)
        {
            // check the requested scopes with the one that are stored in the Client Store 
            var client = _clientStore.Clients.Where(x => x.Clientid == oldValue.ClientId).FirstOrDefault();

            if(client != null)
            {
                var clientScope = (from m in client.Allowedscopes
                                   where requestdScopes.Contains(m)
                                   select m).ToList();

                if(clientScope.Count == 0)
                    return null;

                AuthorizationCode newValue = new()
                {
                    ClientId = oldValue.ClientId,
                    CreationTime = oldValue.CreationTime,
                    IsOpenId = requestdScopes.Contains("openid",StringComparer.OrdinalIgnoreCase) || requestdScopes.Contains("profile"),
                    RedirectUri = oldValue.RedirectUri,
                    RequestedScopes = requestdScopes,
                    Nonce = oldValue.Nonce,
                    CodeChallenge = oldValue.CodeChallenge,
                    CodeChallengeMethod = oldValue.CodeChallengeMethod,
                    Subject = claimsPrincipal,
                };
                var result = _codeIssued.TryUpdate(key, newValue, oldValue);

                if(result)
                    return newValue;
                return null;
            }
        }
        return null;
    }

    public AuthorizationCode? UpdatedClientDataByCode(string key, IList<string> requestdScopes,
         string? nonce = null)
    {
        var oldValue = GetClientDataByCode(key);

        if(oldValue != null)
        {
            // check the requested scopes with the one that are stored in the Client Store 
            var client = _clientStore.Clients.Where(x => x.Clientid == oldValue.ClientId).FirstOrDefault();

            if(client != null)
            {
                var clientScope = (from m in client.Allowedscopes
                                   where requestdScopes.Contains(m)
                                   select m).ToList();



                if(clientScope.Count == 0)
                    return null;

                AuthorizationCode newValue = new()
                {
                    ClientId = oldValue.ClientId,
                    CreationTime = oldValue.CreationTime,
                    IsOpenId = requestdScopes.Contains("openid") || requestdScopes.Contains("profile"),
                    RedirectUri = oldValue.RedirectUri,
                    RequestedScopes = requestdScopes,
                    Nonce = nonce ?? oldValue.Nonce,
                };


                // ------------------ I suppose the user name and password is correct  -----------------
                var claims = new List<Claim>();



                if(newValue.IsOpenId)
                {
                    // TODO
                    // Add more claims to the claims

                }

                var claimIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                newValue.Subject = new ClaimsPrincipal(claimIdentity);
                // ------------------ -----------------------------------------------  -----------------

                var result = _codeIssued.TryUpdate(key, newValue, oldValue);

                if(result)
                    return newValue;
                return null;
            }
        }
        return null;
    }
}