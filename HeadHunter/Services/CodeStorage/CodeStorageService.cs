using HeadHunter.Common;
using HeadHunter.Models;
using HeadHunter.Models.Context;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace HeadHunter.Services.CodeService;

public class CodeStorageService : ICodeStorageService
{
    private readonly ConcurrentDictionary<string, AuthorizationCode> _authorizeCodeIssued = new();
    private readonly ConcurrentDictionary<string, DiscordCode> _discordCodeIssued = new();

    public CodeStorageService()
    {
        StartCleanupTask(TimeSpan.FromMinutes(5));
    }

    public string? CreateAuthorizationCode(HeadhunterDbContext _dbContext, string clientIdentifier, AuthorizationCode authorizationCode)
    {
        var client = _dbContext.Clients.Where(x => x.ClientIdentifier == clientIdentifier).FirstOrDefault();

        if(client is null)
        {
            return null;
        }

        var ExistingCode = _authorizeCodeIssued.FirstOrDefault(x => x.Value.ClientIdentifier == clientIdentifier);

        if(ExistingCode.Value != null)
        {
            return ExistingCode.Key;
        }

        var code = Guid.NewGuid().ToString();

        // then store the code is the Concurrent Dictionary
        _authorizeCodeIssued [code] = authorizationCode;

        return code;
    }

    public string? CreateDiscordCode(HeadhunterDbContext _dbContext, string license, string hwid)
    {
        var ExistingUser = _dbContext.Users.Where(x => x.License == license).FirstOrDefault();

        if(ExistingUser is null)
        {
            return null;
        }

        var ExistingCode = _discordCodeIssued.FirstOrDefault(x => x.Value.User.License == license);

        if(ExistingCode.Key != null && !ExistingCode.Value.isExpired)
        {
            return ExistingCode.Key;
        }

        var tempClient = new DiscordCode
        {
            User = ExistingUser
        };

        tempClient.User.Hwid = hwid;

        var code = EncodingFunctions.GetUniqueKey(20);

        // then store the code is the Concurrent Dictionary
        _discordCodeIssued [code] = tempClient;

        return code;
    }

    public DiscordCode? GetUserByCode(string code)
    {
        if(_discordCodeIssued.TryRemove(code, out DiscordCode? userCode))
        {
            if(userCode.isExpired)
            {
                return null;
            }

            return userCode;
        }

        return null;
    }

    public AuthorizationCode? GetClientByCode(string key)
    {
        if(_authorizeCodeIssued.TryGetValue(key, out AuthorizationCode? authorizationCode))
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
        return _authorizeCodeIssued.TryRemove(key, value: out _);
    }



    private void StartCleanupTask(TimeSpan cleanupInterval)
    {
        Task.Run(async () =>
        {
            while(true)
            {
                await Task.Delay(cleanupInterval);

                if(_authorizeCodeIssued.Count > 0)  // Only run if there are elements in the dictionary
                {
                    CleanupExpiredItems();
                }
            }
        });
    }



    #region helper functions

    private void CleanupExpiredItems()
    {
        if(_authorizeCodeIssued.IsEmpty)
        {
            return;  // No elements to clean up
        }

        foreach(var key in _authorizeCodeIssued.Keys)
        {
            if(_authorizeCodeIssued.TryGetValue(key, out var expiringValue) && expiringValue.isExpired)
            {
                _authorizeCodeIssued.TryRemove(key, out _); // Remove expired items
            }
        }

        foreach(var code in _discordCodeIssued.Keys)
        {
            if(_authorizeCodeIssued.TryGetValue(code, out var expiringValue) && expiringValue.isExpired)
            {
                _authorizeCodeIssued.TryRemove(code, out _); // Remove expired items
            }
        }
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
    #endregion
}