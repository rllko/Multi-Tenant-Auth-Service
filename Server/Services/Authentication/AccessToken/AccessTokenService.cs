using Authentication.Services.Authentication.CodeStorage;
using Microsoft.Extensions.Caching.Memory;

namespace Authentication.Services.Authentication.AccessToken;

public class AccessTokenService : IAccessTokenService
{
    private readonly ICodeService _codeService;
    private readonly MemoryCache _tokenCache;

    public AccessTokenService(ICodeService codeService)
    {
        _codeService = codeService;

        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(10)
        };
        _tokenCache = new MemoryCache(cacheOptions);
    }

    public async Task<string> Generate(Guid accessCode)
    {
        var client = await _codeService.GetClientCode(accessCode.ToString());
        if (client is null)
            throw new Exception("Invalid client code");

        var accessToken = new Endpoints.Authentication.OAuth.TokenEndpoint.AccessToken
        {
            ClientIdentifier = client!.ClientId,
            CreationTime = DateTime.UtcNow
        };

        await _codeService.RemoveClientCode(accessCode.ToString());

        var code = Guid.NewGuid();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(30));

        _tokenCache.Set(code, accessToken, cacheEntryOptions);

        return code.ToString();
    }

    public bool GetByCode(Guid code, out Endpoints.Authentication.OAuth.TokenEndpoint.AccessToken? authCode)
    {
        var result = _tokenCache
            .TryGetValue(code, out Endpoints.Authentication.OAuth.TokenEndpoint.AccessToken? authorizationCode);
        authCode = authorizationCode;
        return result;
    }
}