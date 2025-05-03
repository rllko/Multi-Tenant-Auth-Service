using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Roles;

public class RoleService(IDbConnectionFactory connectionFactory) : IRoleService
{
    public async Task<Option<Role>> GetRoleByIdAsync(Guid roleId)
    {
        const string sql = "SELECT * FROM roles WHERE role_id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var role = await conn.QueryFirstOrDefaultAsync<Role>(sql, new { Id = roleId });
        return role is null ? Option<Role>.None : Option<Role>.Some(role);
    }

    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
        const string sql = "SELECT * FROM roles;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QueryAsync<Role>(sql);
    }

    public async Task<Role> CreateRoleAsync(CreateRoleDto dto, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO roles (role_name, slug, role_type, created_by)
            VALUES (@RoleName, @Slug, @RoleType, @CreatedBy)
            RETURNING *;
        ";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        return await conn.QuerySingleAsync<Role>(sql, dto,transact);
    }

    public async Task<bool> UpdateRoleAsync(Guid roleId, UpdateRoleDto dto, IDbTransaction? transaction = null)
    {
        const string sql = @"
            UPDATE roles
            SET role_name = @RoleName, slug = @Slug, role_type = @RoleType
            WHERE role_id = @Id;
        ";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var affected = await conn.ExecuteAsync(sql, new { dto.RoleName, dto.Slug, dto.RoleType, Id = roleId },transact);
        return affected > 0;
    }

    public async Task<bool> DeleteRoleAsync(Guid roleId, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM roles WHERE role_id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var affected = await conn.ExecuteAsync(sql, new { Id = roleId });
        return affected > 0;
    }

    public async Task<bool> AssignScopeToRoleAsync(Guid roleId, Guid scopeId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO team_role_scopes (role_id, scope_id)
            VALUES (@RoleId, @ScopeId)
            ON CONFLICT DO NOTHING;
        ";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var affected = await conn.ExecuteAsync(sql, new { RoleId = roleId, ScopeId = scopeId },transact);
        return affected > 0;
    }

    public async Task<bool> RemoveScopeFromRoleAsync(Guid roleId, Guid scopeId,IDbTransaction? transaction = null)
    {
        const string sql = @"
            DELETE FROM team_role_scopes
            WHERE role_id = @RoleId AND scope_id = @ScopeId;
        ";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var affected = await conn.ExecuteAsync(sql, new { RoleId = roleId, ScopeId = scopeId },transact);
        return affected > 0;
    }

    public async Task<IEnumerable<Scope>> GetScopesInRoleAsync(Guid roleId)
    {
        const string sql = @"
            SELECT s.*
            FROM scopes s
            JOIN team_role_scopes trs ON s.scope_id = trs.scope_id
            WHERE trs.role_id = @RoleId;
        ";
        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QueryAsync<Scope>(sql, new { RoleId = roleId });
    }
}
