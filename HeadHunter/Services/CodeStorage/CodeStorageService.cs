using HeadHunter.Models;
using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HeadHunter.Services.CodeService;

public class CodeStorageService : ICodeStorageService
{
    private readonly ConcurrentDictionary<string, AuthorizationCode> _authorizeCodeIssued = new();
    private readonly ConcurrentDictionary<string, User> _discordCodeIssued = new();

    internal static readonly char [] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".ToCharArray();

    //private readonly InMemoryClientDatabase _clientStore = new();

    // Here I genrate the code for authorization, and I will store it 
    // in the Concurrent Dictionary, PKCE

    public CodeStorageService()
    {
        StartCleanupTask(TimeSpan.FromMinutes(1));
    }



    public string? CreateAuthorizationCode(HeadhunterDbContext _dbContext, string clientIdentifier, AuthorizationCode authorizationCode)
    {
        var client = _dbContext.Clients.Where(x => x.ClientIdentifier == clientIdentifier).FirstOrDefault();

        if(client is null)
        {
            return null;
        }

        var code = Guid.NewGuid().ToString();

        // then store the code is the Concurrent Dictionary
        _authorizeCodeIssued [code] = authorizationCode;

        return code;
    }



    public string? CreateDiscordCode(HeadhunterDbContext _dbContext, string license)
    {
        var user = _dbContext.Users.Where(x => x.License == license).FirstOrDefault();

        if(user is null)
        {
            return null;
        }

        var code = GetUniqueKey(20);

        // then store the code is the Concurrent Dictionary
        _discordCodeIssued [code] = user;

        return code;
    }



    public User? GetUserByCode(string code)
    {
        if(_discordCodeIssued.TryGetValue(code, out User? userCode))
        {
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



    public AuthorizationCode? RemoveClientByCode(string key)
    {
        _authorizeCodeIssued.TryRemove(key, value: out AuthorizationCode? authorizationCode);
        return null;
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
    private static string GetUniqueKey(int size)
    {

        byte[] data = new byte[4*size];
        using(var crypto = RandomNumberGenerator.Create())
        {
            crypto.GetBytes(data);
        }
        StringBuilder result = new StringBuilder(size);
        for(int i = 0; i < size; i++)
        {
            var rnd = BitConverter.ToUInt32(data, i * 4);
            var idx = rnd % chars.Length;

            result.Append(chars [idx]);
        }

        return result.ToString();
    }



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