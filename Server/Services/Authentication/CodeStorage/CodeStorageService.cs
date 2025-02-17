using Authentication.Database;
using Authentication.Endpoints.Authorization;
using Authentication.Models;
using Dapper;
using Microsoft.Extensions.Caching.Memory;

namespace Authentication.Services.Authentication.CodeStorage;

public class CodeStorageService : ICodeStorageService
{
    //private readonly MemoryCache  _authorizeCodeIssued;
    private readonly MemoryCache _authorizeCodeIssued;
    private readonly IDbConnectionFactory _connectionFactory;

    public CodeStorageService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(1)
        };
        _authorizeCodeIssued = new MemoryCache(cacheOptions);
    }


    public async Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest)
    {
#warning create validation for it

        var connection = await _connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM clients WHERE client_identifier = @identifier;";

        var client = await
            connection.QuerySingleAsync<Client>(getDiscordIdQuery,
                new { identifier = authorizationCodeRequest.ClientIdentifier });

        var code = Guid.NewGuid().ToString();

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(30));

        // then store the code is the Concurrent Dictionary
        _authorizeCodeIssued.Set(code, authorizationCodeRequest, cacheEntryOptions);
        return code;
    }

    public void RemoveClientCode(string key)
    {
        _authorizeCodeIssued.Remove(key);
    }

    public bool GetClientCode(string key, out AuthorizationCodeRequest? clientCode)
    {
        var found = _authorizeCodeIssued.TryGetValue(key, out AuthorizationCodeRequest? userCode);
        clientCode = userCode;
        return found;
    }

    public AuthorizationCodeRequest? GetClientCode(Guid key)
    {
        _authorizeCodeIssued.TryGetValue(key, out AuthorizationCodeRequest? authorizationCode);
        _authorizeCodeIssued.Remove(key);
        return authorizationCode;
    }
}