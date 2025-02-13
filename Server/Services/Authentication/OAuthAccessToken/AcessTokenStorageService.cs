using Authentication.Models;
using Authentication.Services.Authentication.CodeStorage;
using Microsoft.Extensions.Caching.Memory;

namespace Authentication.Services.CodeService;

public class AcessTokenStorageService : IAcessTokenStorageService
{
    private readonly ICodeStorageService _codeStorageService;
    private readonly MemoryCache _tokenCache;

    public AcessTokenStorageService(ICodeStorageService codeStorageService)
    {
        _codeStorageService = codeStorageService;

        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(10)
        };
        _tokenCache = new MemoryCache(cacheOptions);
    }

    public string? Generate(Guid accessCode)
    {
        var client = _codeStorageService.GetClientByCode(accessCode.ToString());

        if (client is null) return null;

        // var accessToken = new AccessToken
        // {
        //     ClientIdentifier = client.ClientIdentifier,
        //     CreationTime = DateTime.UtcNow,
        //     RequestedScopes = client.RequestedScopes,
        //     Subject = client.Subject,
        //     CodeChallenge = client.CodeChallenge!,
        //     CodeChallengeMethod = client.CodeChallengeMethod!
        // };

        var code = Guid.NewGuid();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(30));

        //_tokenCache.Set(code, accessToken, cacheEntryOptions);

        return code.ToString();
    }

    public AccessToken? GetByCode(Guid code)
    {
        return _tokenCache
            .TryGetValue(code, out AccessToken? authorizationCode)
            ? authorizationCode
            : null;
    }
}