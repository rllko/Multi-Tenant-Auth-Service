using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;

namespace Authentication.Services.Clients;

public class ClientService(IDbConnectionFactory connectionFactory) : IClientService
{
    private readonly IDbConnectionFactory _connectionFactory = connectionFactory;

    public async Task<int> CreateClientAsync(Client client)
    {
        var sql = @"
            INSERT INTO clients (client_identifier, client_secret, role, team)
            VALUES (@ClientIdentifier, @ClientSecret, @Role, @Team)
            RETURNING client_id;
        ";

        using var connection = await _connectionFactory.CreateConnectionAsync();

        return await connection.ExecuteScalarAsync<int>(sql, client);
    }

    public async Task<Client?> GetClientByIdentifierAsync(string identifier)
    {
        var sql = "SELECT * FROM clients WHERE client_identifier = @Identifier;";
        using var connection = await _connectionFactory.CreateConnectionAsync();

        return await connection.QueryFirstOrDefaultAsync<Client>(sql, new { Identifier = identifier });
    }

    public async Task<IEnumerable<Client>> GetAllClientsAsync()
    {
        var sql = "SELECT * FROM clients;";
        using var connection = await _connectionFactory.CreateConnectionAsync();

        return await connection.QueryAsync<Client>(sql);
    }

    public async Task<bool> DeleteClientAsync(int clientId)
    {
        var sql = "DELETE FROM clients WHERE client_id = @Id;";
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var rows = await connection.ExecuteAsync(sql, new { Id = clientId });

        return rows > 0;
    }

    public async Task<IEnumerable<Client>> GetClientsByApplicationAsync(Guid applicationGuid)
    {
        var sql = "SELECT * FROM clients WHERE application_id = @applicationGuid;";
        using var connection = await _connectionFactory.CreateConnectionAsync();

        return await connection.QueryAsync<Client>(sql, new { applicationGuid });
    }
}