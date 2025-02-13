using Authentication.Common;
using Authentication.Models;
using Authentication.Services.Licenses;
using Microsoft.Extensions.Caching.Memory;
using DiscordCode = Authentication.Models.DiscordCode;

namespace Authentication.Services.Authentication.CodeStorage;

public class CodeStorageService : ICodeStorageService
{
    //private readonly MemoryCache  _authorizeCodeIssued;
    private readonly MemoryCache _authorizeCodeIssued;
    private readonly IClientService _clientService;
    private readonly MemoryCache _discordCodeIssued;

    private readonly ILicenseService _licenseService;

    public CodeStorageService(ILicenseService licenseService, IClientService clientService)
    {
        _licenseService = licenseService;
        _clientService = clientService;
        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(1)
        };
        _authorizeCodeIssued = new MemoryCache(cacheOptions);
        _discordCodeIssued = new MemoryCache(cacheOptions);
    }

    public async Task<string?> CreateDiscordCodeAsync(long licenseId)
    {
        var targetLicense = await _licenseService.GetLicenseByIdAsync(licenseId);

        if (targetLicense is null) return null;

        var tempClient = new DiscordCode
        {
            License = targetLicense
        };

        var existingCode = (DiscordCode)_discordCodeIssued.Get(tempClient)!;

        if (existingCode.ExpirationTime < DateTime.Now) return existingCode.Code;

        var code = EncodingFunctions.GetUniqueKey(20);
        existingCode.Code = code;

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

        // then store the code is the Concurrent Dictionary
        _discordCodeIssued.Set(code, tempClient, cacheEntryOptions);
        return code;
    }

    public AuthorizationCodeRequest? GetClientByCode(string? key)
    {
        throw new NotImplementedException();
    }

    public DiscordCode? GetDiscordCode(string code)
    {
        _discordCodeIssued.TryGetValue(code, out DiscordCode? userCode);
        _discordCodeIssued.Remove(code);
        return userCode;
    }

    public async Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest)
    {
        var client = await _clientService.GetClientByIdentifierAsync(authorizationCodeRequest.ClientIdentifier!);

        if (client is null) return null;

        var code = Guid.NewGuid().ToString();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(30));

        // then store the code is the Concurrent Dictionary
        _authorizeCodeIssued.Set(code, authorizationCodeRequest, cacheEntryOptions);

        return code;
    }

    public AuthorizationCodeRequest? GetClientByCode(Guid key)
    {
        _authorizeCodeIssued.TryGetValue(key, out AuthorizationCodeRequest? authorizationCode);
        _authorizeCodeIssued.Remove(key);
        return authorizationCode;
    }
}