using Authentication.Endpoints.Token;
using Authentication.Services.Authentication.CodeStorage;
using Microsoft.Extensions.Caching.Memory;

namespace Authentication.Services.Authentication.OAuthAccessToken;

public class AccessTokenStorageService : IAccessTokenStorageService
{
    private readonly ICodeStorageService _codeStorageService;
    private readonly MemoryCache _tokenCache;

    public AccessTokenStorageService(ICodeStorageService codeStorageService)
    {
        _codeStorageService = codeStorageService;

        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(10)
        };
        _tokenCache = new MemoryCache(cacheOptions);
    }

    public string Generate(Guid accessCode)
    {
        if (_codeStorageService.GetClientCode(accessCode.ToString(), out var client) is false)
            throw new Exception("Invalid client code");

        var accessToken = new AccessToken
        {
            ClientIdentifier = client!.ClientIdentifier,
            CreationTime = DateTime.UtcNow
        };

        _codeStorageService.RemoveClientCode(accessCode.ToString());

        var code = Guid.NewGuid();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(30));

        _tokenCache.Set(code, accessToken, cacheEntryOptions);

        return code.ToString();
    }

    public bool GetByCode(Guid code, out AccessToken? authCode)
    {
        var result = _tokenCache
            .TryGetValue(code, out AccessToken? authorizationCode);
        authCode = authorizationCode;
        return result;
    }
}