using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Services.Teams;
using Authentication.Services.Tenants;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Invites;

public class InviteService(
    IDbConnectionFactory connectionFactory,
    ITeamService teamService,
    ITenantService tenantService) : IInviteService
{
    public async Task<Option<TenantInvite>> GetInviteByTokenAsync(string token)
    {
        const string sql =
            """
                SELECT id as Id,
                       tenant_id as TenantId,
                       team_id as TeamId,
                       status as Status,
                       invite_token as InviteToken,
                       expires_at as ExpiresAt,
                       created_by as CreatedBy,
                       created_at as CreatedAt,
                       accepted_at as AcceptedAt
                 FROM tenant_invites WHERE invite_token = @Token;
            """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        var invite = await conn.QueryFirstOrDefaultAsync<TenantInvite>(sql, new { Token = token });

        return invite is null ? Option<TenantInvite>.None : Option<TenantInvite>.Some(invite);
    }

    public async Task<IEnumerable<TenantInviteDto>> GetInvitesByTenantIdAsync(Guid tenantId)
    {
        const string sql =
            """
                SELECT ti.invite_token as InviteToken,
                       tenants.name as CreatedBy,
                       teams.name as TeamName,
                       tenants.email as CreatedByEmail,
                       tenant_invite_statuses.name as Status,
                       ti.expires_at as ExpiresAt,
                       ti.created_at as CreatedAt
                FROM tenant_invites ti 
                JOIN teams on ti.team_id = teams.id
                JOIN tenant_invite_statuses on ti.status = tenant_invite_statuses.id
                JOIN tenants on teams.created_by = tenants.id
                WHERE tenant_id = @TenantId;
            """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        return await conn.QueryAsync<TenantInviteDto>(sql, new { TenantId = tenantId });
    }

    public async Task<IEnumerable<TenantInviteDto>> GetInvitesPendingByTenantIdAsync(Guid tenantId)
    {
        const string sql =
            """
                SELECT ti.invite_token as InviteToken,
                       tenants.name as CreatedBy,
                       teams.name as TeamName,
                       tenants.email as CreatedByEmail,
                       tenant_invite_statuses.name as Status,
                       ti.expires_at as ExpiresAt,
                       ti.created_at as CreatedAt
                FROM tenant_invites ti 
                JOIN teams on ti.team_id = teams.id
                JOIN tenant_invite_statuses on ti.status = tenant_invite_statuses.id
                JOIN tenants on teams.created_by = tenants.id
                WHERE tenant_id = @TenantId and tenant_invite_statuses.slug = 'PENDING'
            """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        return await conn.QueryAsync<TenantInviteDto>(sql, new { TenantId = tenantId });
    }

    public async Task<IEnumerable<TenantInviteDto>> GetInvitesSentByTenantIdAsync(Guid tenantId)
    {
        const string sql =
            """
                SELECT ti.invite_token as InviteToken,
                       tenants.name as CreatedBy,
                       teams.name as TeamName,
                       tenants.email as CreatedByEmail,
                       tenant_invite_statuses.name as Status,
                       ti.expires_at as ExpiresAt,
                       ti.created_at as CreatedAt
                FROM tenant_invites ti 
                JOIN teams on ti.team_id = teams.id
                JOIN tenant_invite_statuses on ti.status = tenant_invite_statuses.id
                JOIN tenants on teams.created_by = tenants.id
                WHERE ti.created_by = @TenantId;
            """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        return await conn.QueryAsync<TenantInviteDto>(sql, new { TenantId = tenantId });
    }

    public async Task<Option<TenantInvite>> CreateInviteAsync(string email,
        string message,
        Guid teamId,
        Guid createdByGuid,
        IDbTransaction? transaction = null)
    {
        var tenant = await tenantService.GetTenantByEmailAsync(email);


        const string sql2 =
            """
                SELECT id as Id
                 FROM tenant_invites WHERE tenant_id = @Token and team_id = @TeamId
                                and status = (select id from tenant_invite_statuses where slug = 'PENDING');
            """;

        using var conn = await connectionFactory.CreateConnectionAsync();

        return await tenant.Match(async tenant =>
            {
                var invite = await conn.QueryAsync<TenantInvite>(sql2, new { Token = tenant.Id, TeamId = teamId });

                if (invite.Any()) return null;

                const string sql =
                    """
                        INSERT INTO tenant_invites (tenant_id, invite_token,message, expires_at,status ,created_by,team_id)
                        VALUES (@TenantId, @InviteToken,@Message ,@ExpiresAt,@Status, @CreatedBy,@TeamId)
                        RETURNING *;
                    """;

                var status = await conn.QueryFirstOrDefaultAsync<int>("""
                                                                      SELECT id
                                                                          FROM tenant_invite_statuses
                                                                          WHERE slug = 'PENDING'
                                                                      """);

                return await conn.QuerySingleAsync<TenantInvite>(sql,
                    new
                    {
                        tenantId = tenant.Id,
                        InviteToken = Guider.ToStringFromGuid(Guid.NewGuid()),
                        Message = message,
                        ExpiresAt = DateTime.Today.AddDays(7),
                        Status = status,
                        CreatedBy = createdByGuid,
                        TeamId = teamId
                    },
                    transaction);
            },
            () => null);
    }

    public async Task<bool> AcceptInviteAsync(string token, Guid teamId, Guid userId, Guid invitedBy,
        IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE tenant_invites
            SET accepted_at = NOW(),
                status = (SELECT id from tenant_invite_statuses where slug = 'ACCEPTED')
            WHERE invite_token = @Token
              AND accepted_at IS NULL
              AND expires_at > NOW();
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        try
        {
            var affected = await conn.ExecuteAsync(sql, new { Token = token }, transact);

            await teamService.AddUserToTeamAsync(teamId, userId, invitedBy);
        }
        catch (Exception e)
        {
            transact.Rollback();

            return false;
        }

        transact.Commit();

        return true;
    }

    public async Task<bool> DeleteInviteAsync(string token, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM tenant_invites WHERE invite_token = @Id;";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var affected = await conn.ExecuteAsync(sql, new { Id = token }, transaction);

        return affected > 0;
    }
}