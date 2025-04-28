using Authentication.Database;
using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Authentication.Models;
using Authentication.Services.Logger;
using Dapper;
using Redis.OM;
using Redis.OM.Searching;

namespace Authentication.Services.Authentication.CodeStorage;

public class CodeService(
    RedisConnectionProvider provider,
    IDbConnectionFactory connectionFactory,
    ILoggerService loggerService) : ICodeService
{
    private readonly IDbConnectionFactory _connectionFactory = connectionFactory;
    private readonly ILoggerService _loggerService = loggerService;

    private readonly RedisConnectionProvider _provider = provider;

    private readonly RedisCollection<AuthorizationCodeRequest> _sessions =
        (RedisCollection<AuthorizationCodeRequest>)provider.RedisCollection<AuthorizationCodeRequest>();

    private readonly TimeSpan _sessionTtl = TimeSpan.FromSeconds(30);

    public async Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest)
    {
        var connection = await _connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM clients WHERE client_identifier = @identifier;";

        var client = await
            connection.QuerySingleAsync<Client>(getDiscordIdQuery,
                new { identifier = authorizationCodeRequest.ClientId });

        var code = Guid.NewGuid().ToString();

        authorizationCodeRequest.Key = code;

        await _sessions.InsertAsync(authorizationCodeRequest, _sessionTtl);

        return code;
    }

    public async Task RemoveClientCode(string key)
    {
        var session = await GetClientCode(key);

        if (session == null) return;

        await _sessions.DeleteAsync(session);
    }

    public async Task<AuthorizationCodeRequest?> GetClientCode(string key)
    {
        return await _sessions.FindByIdAsync(key);
    }
}