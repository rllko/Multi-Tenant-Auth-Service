using Authentication.Database;
using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Dapper;

namespace Authentication.Services.Clients;

public class ClientService(IDbConnectionFactory connectionFactory) : IClientService
{
    public async Task<Client?> GetClientByIdentifierAsync(string identifier)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM clients WHERE client_identifier = @identifier;";

        var result = await
            connection.QueryFirstOrDefaultAsync(getDiscordIdQuery, new { identifier });

        if (result != null)
        {
            var client = new Client
            {
                ClientId = result.client_id,
                ClientIdentifier = result.client_identifier,
                ClientSecret = result.client_secret,
                GrantType = result.grant_type,
                ClientUri = result.client_uri
            };

            return client;
        }

        return null;
    }

    public async Task<IEnumerable<string>> GetClientScopesAsync(string identifier)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"
        SELECT s.scope_name FROM client_scopes 
        inner join clients c
            on client_scopes.client_id = c.client_id 
        inner join scopes s on client_scopes.scope_id = s.scope_id
            WHERE client_identifier = @identifier;";

        var client = await
            connection.QueryAsync<string>(getDiscordIdQuery, new { identifier });
        return client;
    }
}