using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Teams;

public class TeamService(IDbConnectionFactory connectionFactory) : ITeamService
{
    public async Task<Option<Team>> GetTeamByIdAsync(Guid teamId)
    {
        var sql = "SELECT * FROM teams WHERE id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();

        var team = await conn.QueryFirstOrDefaultAsync<Team>(sql, new { Id = teamId });
        return team == null ? Option<Team>.None : Option<Team>.Some(team);
    }

    public async Task<Option<IEnumerable<Team>>> GetTeamsForUserAsync(Guid userId)
    {
        var sql = @"
            SELECT t.*
            FROM teams t
            JOIN team_tenants tt ON t.id = tt.team
            WHERE tt.tenant = @UserId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        var teams = (await conn.QueryAsync<Team>(sql, new { UserId = userId })).ToList();

        return teams.Any() ? Option<IEnumerable<Team>>.Some(teams) : Option<IEnumerable<Team>>.None;
    }

    public async Task<IEnumerable<Team>> GetAllTeamsAsync()
    {
        var sql = "SELECT * FROM teams;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QueryAsync<Team>(sql);
    }

    public async Task<Team> CreateTeamAsync(TeamCreateDto dto, IDbTransaction? transaction = null)
    {
        var sql = @"
            INSERT INTO teams (name)
            VALUES (@Name)
            RETURNING *;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        return await conn.QuerySingleAsync<Team>(sql, dto);
    }

    public async Task<bool> UpdateTeamAsync(Guid teamId, TeamUpdateDto dto, IDbTransaction? transaction = null)
    {
        var sql = "UPDATE teams SET name = @Name WHERE id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var rows = await conn.ExecuteAsync(sql, new { dto.Name, Id = teamId });
        return rows > 0;
    }

    public async Task<bool> DeleteTeamAsync(Guid teamId, IDbTransaction? transaction = null)
    {
        var sql = "DELETE FROM teams WHERE id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var rows = await conn.ExecuteAsync(sql, new { Id = teamId });
        return rows > 0;
    }

    public async Task<bool> AddUserToTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null)
    {
        var sql = @"
            INSERT INTO team_tenants (tenant, team, created_at)
            VALUES (@UserId, @TeamId, @Now)
            ON CONFLICT DO NOTHING;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var rows = await conn.ExecuteAsync(sql, new { UserId = userId, TeamId = teamId, Now = now });
        return rows > 0;
    }

    public async Task<bool> RemoveUserFromTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null)
    {
        var sql = "DELETE FROM team_tenants WHERE team = @TeamId AND tenant = @UserId;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var rows = await conn.ExecuteAsync(sql, new { TeamId = teamId, UserId = userId });
        return rows > 0;
    }

    public async Task<IEnumerable<Tenant>> GetTenantsInTeamAsync(Guid teamId)
    {
        var sql = @"
            SELECT ten.*
            FROM tenants ten
            JOIN team_tenants tt ON ten.id = tt.tenant
            WHERE tt.team = @TeamId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QueryAsync<Tenant>(sql, new { TeamId = teamId });
    }
}