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

    public async Task<IEnumerable<ScopeDto>> GetClientScopesForTeamAsync(Guid teamId, Guid applicationGuid)
    {
        var sql = """
                      SELECT 
                          s.scope_id as Id,
                          s.scope_name,
                         'todo' as description,
                         s.created_by,
                         permission_impact_levels.name as impact,
                         scope_categories.name as resource
                      FROM teams t
                           RIGHT JOIN scopes s on s.created_by = t.id
                           JOIN permission_impact_levels on s.impact_level_id = permission_impact_levels.id
                           JOIN scope_categories on s.category_id = scope_categories.id
                           JOIN scope_types on s.scope_type = scope_types.id
                      WHERE s.created_by = @TeamId 
                          or s.created_by is null 
                          and scope_types.slug not in ('TEAM_SCOPE')
                          and scope_categories.slug not in ('APPLICATION_MANAGEMENT')
                      ORDER BY permission_impact_levels.name;
                  """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        var scopes = await conn.QueryAsync<dynamic>(sql, new { TeamId = teamId });

        var response = scopes.Select(result => new ScopeDto(result.id, result.scope_name, result.description,
            result.created_by, result.impact,
            result.resource)).ToList();

        return response;
    }
}