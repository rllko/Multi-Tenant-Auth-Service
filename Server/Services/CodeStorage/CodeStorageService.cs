using System.Collections.Concurrent;
using Authentication.Common;
using Authentication.Models;
using Authentication.Models.Context;

namespace Authentication.Services.CodeService;

public class CodeStorageService : ICodeStorageService
{
    //private readonly MemoryCache  _authorizeCodeIssued;
    private readonly ConcurrentDictionary<string, AuthorizationCode> _authorizeCodeIssued = new();
    private readonly ConcurrentDictionary<string, DiscordCode> _discordCodeIssued = new();

    public CodeStorageService()
    {
        StartCleanupTask(TimeSpan.FromMinutes(5));
    }

    public string? CreateAuthorizationCode(AuthenticationDbContext _dbContext, string? clientIdentifier,
        AuthorizationCode authorizationCode)
    {
        var client = _dbContext.Clients.Where(x => x.ClientIdentifier == clientIdentifier).FirstOrDefault();

        if (client is null) return null;

        var ExistingCode = _authorizeCodeIssued.FirstOrDefault(x => x.Value.ClientIdentifier == clientIdentifier);

        if (ExistingCode.Value != null) return ExistingCode.Key;

        var code = Guid.NewGuid().ToString();

        // then store the code is the Concurrent Dictionary
        _authorizeCodeIssued[code] = authorizationCode;

        return code;
    }

    public string? CreateDiscordCode(AuthenticationDbContext _dbContext, string license)
    {
        var ExistingUser = _dbContext.Users.Where(x => x.License == license).FirstOrDefault();

        if (ExistingUser is null) return null;

        var ExistingCode = _discordCodeIssued.FirstOrDefault(x => x.Value.User.License == license);

        if (ExistingCode.Key != null && !ExistingCode.Value.isExpired) return ExistingCode.Key;

        var tempClient = new DiscordCode
        {
            User = ExistingUser
        };

        var code = EncodingFunctions.GetUniqueKey(20);

        // then store the code is the Concurrent Dictionary
        _discordCodeIssued[code] = tempClient;

        return code;
    }

    public DiscordCode? GetUserByCode(string code)
    {
        Console.WriteLine(_discordCodeIssued.Select(x => $"{x.Key} -> {x.Value}"));
        if (_discordCodeIssued.TryGetValue(code, out var userCode))
        {
            if (userCode.isExpired) return null;

            return userCode;
        }

        return null;
    }

    public AuthorizationCode? GetClientByCode(string key)
    {
        if (_authorizeCodeIssued.TryGetValue(key, out var authorizationCode))
        {
            if (authorizationCode.IsExpired) return null;
            return authorizationCode;
        }

        return null;
    }

    public bool RemoveClientByCode(Guid key)
    {
        return _authorizeCodeIssued.TryRemove(key.ToString(), out _);
    }


    private void StartCleanupTask(TimeSpan cleanupInterval)
    {
        Task.Run(async () =>
        {
            while (true)
            {
                await Task.Delay(cleanupInterval);

                if (_authorizeCodeIssued.Count > 0) // Only run if there are elements in the dictionary
                    CleanupExpiredItems();
            }
        });
    }

    #region helper functions

    private void CleanupExpiredItems()
    {
        if (_authorizeCodeIssued.IsEmpty) return; // No elements to clean up

        foreach (var key in _authorizeCodeIssued.Keys)
            if (_authorizeCodeIssued.TryGetValue(key, out var expiringValue) && expiringValue.IsExpired)
                _authorizeCodeIssued.TryRemove(key, out _); // Remove expired items

        foreach (var code in _discordCodeIssued.Keys)
            if (_authorizeCodeIssued.TryGetValue(code, out var expiringValue) && expiringValue.IsExpired)
                _authorizeCodeIssued.TryRemove(code, out _); // Remove expired items
    }

    #endregion
}