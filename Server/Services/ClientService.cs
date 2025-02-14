using Authentication.Database;
using Authentication.Endpoints.Authorization;
using Authentication.Services.Authentication;
using Dapper;

namespace Authentication.Services;

public class ClientService(IDbConnectionFactory connectionFactory) : IClientService
{
    public async Task<Client?> GetClientByIdentifierAsync(string identifier)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var getDiscordIdQuery = @"SELECT * FROM clients WHERE client_identifier = @identifier;";

        var client = await
            connection.QueryFirstAsync<Client>(getDiscordIdQuery, new { identifier });
        return client;
    }

    public async Task<Client> GetClient(AuthorizeRequest clientRequest)
    {
        throw new NotImplementedException();
    }
}