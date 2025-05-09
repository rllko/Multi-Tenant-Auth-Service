using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using FluentValidation.Results;
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

    public async Task<Result<TeamDto, ValidationFailed>> CreateTeamAsync(TeamCreateDto dto, Guid createdBy,
        IDbTransaction? transaction = null)
    {
        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        try
        {
            var sql = @"
            INSERT INTO teams (name,created_by)
            VALUES (@Name, @CreatedBy)
            RETURNING *;
        ";

            var team = await conn.QuerySingleAsync<Team>(sql, new { dto.Name, CreatedBy = createdBy }, transact);

            var roleID = await conn.QuerySingleAsync<int>("SELECT role_id from roles where slug = 'TEAM_ADMIN'");

            var teamTenantsql = @"
            INSERT INTO team_tenants (invited_by, tenant, team, role,created_at)
            VALUES (@InvitedBy, @Tenant, @Team, @Role,NOW());
        ";

            var insertedRegisters =
                await conn.ExecuteAsync(teamTenantsql,
                    new { InvitedBy = createdBy, Tenant = createdBy, Team = team.Id, Role = roleID }, transact);

            if (insertedRegisters is 0)
            {
                transact.Rollback();

                return new ValidationFailed(new ValidationFailure("err_association", "something went wrong!"));
            }

            transact.Commit();

            return team.ToDto();
        }
        catch (Exception e)
        {
            transact.Rollback();

            throw;
        }
    }

    public async Task<IEnumerable<TenantDto>> GetTenantsInTeamAsync(Guid teamId)
    {
        var sql = @"
            SELECT ten.*
            FROM tenants ten
            JOIN team_tenants tt ON ten.id = tt.tenant
            WHERE tt.team = @TeamId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var tenants = await conn.QueryAsync<Tenant>(sql, new { TeamId = teamId });

        return tenants.Select(tenant => tenant.ToDto()).ToList();
    }
}