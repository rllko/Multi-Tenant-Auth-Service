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

    public async Task<Option<IEnumerable<ScopeDto>>> GetTeamScopesAsync(Guid teamId)
    {
        var sql = @"
            SELECT s.scope_name,
                   s.scope_id as Id,
                   'todo' as description,
                   s.created_by,
                   permission_impact_levels.name as impact,
                   scope_categories.name as resource
            FROM teams t
                 RIGHT JOIN scopes s on s.created_by = t.id
                 JOIN permission_impact_levels on s.impact_level_id = permission_impact_levels.id
                 JOIN scope_categories on s.category_id = scope_categories.id
            WHERE s.created_by = @TeamId or s.created_by is null
            ORDER BY permission_impact_levels.name;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var scopes = await conn.QueryAsync<dynamic>(sql, new { TeamId = teamId });

        var response = scopes.Select(result => new ScopeDto(result.id, result.scope_name, result.description,
            result.created_by, result.impact,
            result.resource)).ToList();

        return scopes.Any() ? Option<IEnumerable<ScopeDto>>.Some(response) : Option<IEnumerable<ScopeDto>>.None;
    }

    public async Task<bool> RemoveUserFromTeamAsync(Guid teamId, Guid tenantGuid, IDbTransaction? transaction = null)
    {
        var sql = "DELETE FROM team_tenants WHERE team = @TeamId AND tenant = @TenantGuid;";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        try
        {
            var rows = await conn.ExecuteAsync(sql, new { TeamId = teamId, TenantGuid = tenantGuid }, transact);

            transact.Commit();

            return rows > 0;
        }
        catch (Exception e)
        {
            transact.Rollback();

            throw;
        }
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

            var roleID = await conn.QuerySingleAsync<int>("SELECT role_id from roles where slug = 'TEAM_OWNER'");

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
            SELECT t.id as Id,
                   discordid as DiscordId,
                   name as Name,
                   Email as Email,
                   r.role_name as Role
            FROM tenants t
            JOIN team_tenants tt ON t.id = tt.tenant
            JOIN roles r on tt.role = r.role_id
            WHERE tt.team = @TeamId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var tenants = await conn.QueryAsync<TenantDto>(sql, new { TeamId = teamId });

        return tenants.ToList();
    }

    public async Task<TenantDto> GetTenantInTeamAsync(Guid teamId, Guid tenantId)
    {
        var sql = @"
            SELECT t.id as Id,
                   discordid as DiscordId,
                   name as Name,
                   Email as Email,
                   r.role_name as Role
            FROM tenants t
            JOIN team_tenants tt ON t.id = tt.tenant
            JOIN roles r on tt.role = r.role_id
            WHERE tt.team = @TeamId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var tenant = await conn.QuerySingleAsync<TenantDto>(sql, new { TeamId = teamId });

        return tenant;
    }

    public async Task<Option<IEnumerable<Role>>> GetTeamRolesAsync(Guid teamId)
    {
        var sql = @"
            SELECT r.role_id as RoleId,
                   r.role_name as RoleName,
                   r.role_type as RoleType,
                   r.created_by as CreatedBy,
                   r.description as Description,
                   r.slug as Slug
            FROM teams t
                 RIGHT JOIN roles r on r.created_by = t.id
                 JOIN role_types on r.role_type = role_types.id
            WHERE r.created_by = @TeamId or r.created_by is null;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        var roles = (await conn.QueryAsync<Role>(sql, new { TeamId = teamId })).ToList();

        return roles.Any() ? Option<IEnumerable<Role>>.Some(roles) : Option<IEnumerable<Role>>.None;
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

    public async Task<bool> CheckUserScopesAsync(Guid tenantId, string teamId, string permissionSlug)
    {
        var scopes = await GetScopesForUserInTeamAsync(tenantId, Guid.Parse(teamId));

        return scopes.Match(scopeList => scopeList.Contains(permissionSlug),
            () => false);
    }

    public async Task<Option<IEnumerable<string>>> GetScopesForUserInTeamAsync(Guid userId, Guid teamId)
    {
        var sql = """
                      SELECT scopes.slug FROM team_tenants tt
                          JOIN teams t on tt.team = t.id
                          JOIN roles on tt.role = roles.role_id
                          JOIN role_scopes rs on rs.role_id = roles.role_id
                          JOIN scopes on scopes.scope_id = rs.scope_id
                      WHERE tt.tenant = @UserId 
                          AND tt.team = @TeamId 
                      group by scopes.scope_id
                      order by scopes.scope_id
                  """;

        using var conn = await connectionFactory.CreateConnectionAsync();
        var teams = (await conn.QueryAsync<string>(sql, new { UserId = userId, teamId })).ToList();

        return teams.Any() ? Option<IEnumerable<string>>.Some(teams) : Option<IEnumerable<string>>.None;
    }

    public async Task<bool> AddUserToTeamAsync(Guid teamId, Guid userId, Guid invitedBy,
        IDbTransaction? transaction = null)
    {
        var sql = @"
            INSERT INTO team_tenants (tenant, team,role, created_at,invited_by)
            VALUES (@UserId, @TeamId,(SELECT role_id FROM roles where slug = 'MODERATOR') ,NOW(),@InvitedBy)
            ON CONFLICT DO NOTHING;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var rows = await conn.ExecuteAsync(sql, new { UserId = userId, TeamId = teamId, InvitedBy = invitedBy });

        return rows > 0;
    }
}