using System.Security.Cryptography;
using System.Text;
using Authentication.Database;
using Authentication.Endpoints.Authorization;
using Authentication.Models;
using Authentication.Models.Entities;
using Dapper;
using Microsoft.Extensions.Caching.Memory;

namespace Authentication.Services.Authentication.CodeStorage;

public class CodeStorageService : ICodeStorageService
{
    //private readonly MemoryCache  _authorizeCodeIssued;
    private readonly MemoryCache _authorizeCodeIssued;
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly MemoryCache _discordCodeIssued;

    public CodeStorageService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
        var cacheOptions = new MemoryCacheOptions
        {
            ExpirationScanFrequency = TimeSpan.FromMinutes(1)
        };
        _authorizeCodeIssued = new MemoryCache(cacheOptions);
        _discordCodeIssued = new MemoryCache(cacheOptions);
    }

    public string CreateDiscordCodeAsync(License license)
    {
        var tempClient = new DiscordCode
        {
            License = license
        };

        var existingCode = _discordCodeIssued.Get<DiscordCode?>(tempClient)!;

        if (existingCode?.ExpirationTime < DateTime.Now) return existingCode.Code!;

        var code = GetUniqueKey(20);
        tempClient.Code = code;

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

        // then store the code is the Concurrent Dictionary
        _discordCodeIssued.Set(code, tempClient, cacheEntryOptions);
        return code;
    }

    public DiscordCode? GetDiscordCode(string code)
    {
        _discordCodeIssued.TryGetValue(code, out DiscordCode? userCode);
        return userCode;
    }

    public async Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest)
    {
#warning

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

    public void RemoveDiscordCode(string code)
    {
        _discordCodeIssued.Remove(code);
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

    public static string GetUniqueKey(int size)
    {
        var chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".ToCharArray();

        var data = new byte[4 * size];
        using (var crypto = RandomNumberGenerator.Create())
        {
            crypto.GetBytes(data);
        }

        var result = new StringBuilder(size);
        for (var i = 0; i < size; i++)
        {
            var rnd = BitConverter.ToUInt32(data, i * 4);
            var idx = rnd % chars.Length;

            result.Append(chars[idx]);
        }

        return result.ToString();
    }
}