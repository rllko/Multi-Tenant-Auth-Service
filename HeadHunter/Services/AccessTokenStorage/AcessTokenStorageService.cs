using HeadHunter.Models;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace HeadHunter.Services.CodeService;

public class AcessTokenStorageService : IAcessTokenStorageService
{
    private readonly ConcurrentDictionary<string, AccessToken> _accessTokenDictionary = new();
    private readonly ICodeStorageService _codeStorageService;

    public AcessTokenStorageService(ICodeStorageService codeStorageService)
    {
        _codeStorageService = codeStorageService;
        StartCleanupTask(TimeSpan.FromMinutes(1));
    }

    // Here I genrate the code for authorization, and I will store it 
    // in the Concurrent Dictionary, PKCE

    public string? Generate(string accessCode)
    {
        var client = _codeStorageService.GetClientByCode(accessCode);

        _codeStorageService.RemoveClientByCode(accessCode);

        var accessToken = new AccessToken
        {
            ClientIdentifier = client.ClientIdentifier,
            ClientSecret = client.ClientSecret,
            RedirectUri = client.RedirectUri,
            CreationTime = DateTime.UtcNow,
            IsOpenId = client.IsOpenId,
            RequestedScopes = client.RequestedScopes,
            Subject = client.Subject,
            Nonce = client.Nonce,
            CodeChallenge = client.CodeChallenge,
            CodeChallengeMethod = client.CodeChallengeMethod,
        };

        if(client is null)
        {
            return null;
        }

        var ExistingCode = _accessTokenDictionary.FirstOrDefault(x => x.Value.ClientIdentifier == accessToken.ClientIdentifier);

        if(ExistingCode.Value != null)
        {
            return ExistingCode.Key;
        }

        var code = Guid.NewGuid().ToString();

        // then store the code is the Concurrent Dictionary
        _accessTokenDictionary [code] = accessToken;

        return code;
    }

    public AccessToken? GetByCode(string code)
    {
        if(_accessTokenDictionary.TryGetValue(code, out AccessToken? authorizationCode))
        {
            if(authorizationCode.isExpired)
            {
                return null;
            }
            return authorizationCode;
        }
        return null;
    }

    public bool RemoveClientByCode(string key)
    {
        return _accessTokenDictionary.TryRemove(key, value: out _);
    }

    // TODO
    // Before updated the Concurrent Dictionary I have to Process User Sign In,
    // and check the user credienail first
    // But here I merge this process here inside update Concurrent Dictionary method
    public AuthorizationCode? UpdatedClientByCode(string code, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes)
    {
        //var oldValue = GetByCode(key);

        //if(oldValue != null)
        //{
        //    // check the requested scopes with the one that are stored in the Client Store 
        //    var client = _clientStore.Clients.Where(x => x.Clientid == oldValue.ClientId).FirstOrDefault();

        //    if(client != null)
        //    {
        //        var clientScope = (from m in client.Allowedscopes
        //                           where requestdScopes.Contains(m)
        //                           select m).ToList();

        //        if(clientScope.Count == 0)
        //            return null;

        //        AuthorizationCode newValue = new()
        //        {
        //            ClientId = oldValue.ClientId,
        //            CreationTime = oldValue.CreationTime,
        //            IsOpenId = requestdScopes.Contains("openid",StringComparer.OrdinalIgnoreCase) || requestdScopes.Contains("profile"),
        //            RedirectUri = oldValue.RedirectUri,
        //            RequestedScopes = requestdScopes,
        //            Nonce = oldValue.Nonce,
        //            CodeChallenge = oldValue.CodeChallenge,
        //            CodeChallengeMethod = oldValue.CodeChallengeMethod,
        //            Subject = claimsPrincipal,
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
        //    var oldValue = GetClientByCode(key);

        //    if(oldValue != null)
        //    {
        //        // check the requested scopes with the one that are stored in the Client Store 
        //        var client = _clientStore.Clients.Where(x => x.Clientid == oldValue.ClientId).FirstOrDefault();

        //        if(client != null)
        //        {
        //            var clientScope = (from m in client.Allowedscopes
        //                               where requestdScopes.Contains(m)
        //                               select m).ToList();



        //            if(clientScope.Count == 0)
        //                return null;

        //            AuthorizationCode newValue = new()
        //            {
        //                ClientId = oldValue.ClientId,
        //                CreationTime = oldValue.CreationTime,
        //                IsOpenId = requestdScopes.Contains("openid") || requestdScopes.Contains("profile"),
        //                RedirectUri = oldValue.RedirectUri,
        //                RequestedScopes = requestdScopes,
        //                Nonce = nonce ?? oldValue.Nonce,
        //            };


        //            // ------------------ I suppose the user name and password is correct  -----------------
        //            var claims = new List<Claim>();



        //            if(newValue.IsOpenId)
        //            {
        //                // TODO
        //                // Add more claims to the claims

        //            }

        //            var claimIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        //            newValue.Subject = new ClaimsPrincipal(claimIdentity);
        //            // ------------------ -----------------------------------------------  -----------------

        //            var result = _codeIssued.TryUpdate(key, newValue, oldValue);

        //            if(result)
        //                return newValue;
        //            return null;
        //        }
        //    }
        return null;
    }

    private void CleanupExpiredItems()
    {
        if(_accessTokenDictionary.IsEmpty)
        {
            return;  // No elements to clean up
        }

        foreach(var key in _accessTokenDictionary.Keys)
        {
            if(_accessTokenDictionary.TryGetValue(key, out var expiringValue) && expiringValue.isExpired)
            {
                _accessTokenDictionary.TryRemove(key, out _); // Remove expired items
            }
        }
    }

    private void StartCleanupTask(TimeSpan cleanupInterval)
    {
        Task.Run(async () =>
        {
            while(true)
            {
                await Task.Delay(cleanupInterval);

                if(_accessTokenDictionary.Count > 0)  // Only run if there are elements in the dictionary
                {
                    CleanupExpiredItems();
                }
            }
        });
    }

}
