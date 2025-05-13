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
        var typesql = "select id from role_types where role_types.slug = 'TEAM_ROLE' ";

        const string sql = @"
            INSERT INTO roles (role_name, slug, role_type, created_by)
            VALUES (@Name, @Slug,@RoleType , @CreatedBy)
            RETURNING *;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        var type = await conn.QuerySingleAsync<int>(typesql, dto, transact);
        dto.RoleType = type;

        dto.Slug = dto.Slug ?? dto.Name.ToUpper().Replace(' ', '_');

        var role = await conn.QuerySingleAsync<Role>(sql, dto, transact);
        transact.Commit();

        return role;
    }

    public async Task<bool> UpdateRoleAsync(Guid roleId, UpdateRoleDto dto, IDbTransaction? transaction = null)
    {
        using var conn = await connectionFactory.CreateConnectionAsync();
        var localTransaction = transaction ?? conn.BeginTransaction();
        var role = await GetRoleByIdAsync(roleId);

        const string sql = @"
            UPDATE roles
            SET role_name = @RoleName, slug = @Slug, role_type = @RoleType
            WHERE role_id = @Id;
        ";

        return await role.Match(
            async r =>
            {
                if (r.CreatedBy != dto.CreatedBy)
                    return false;


                try
                {
                    var affected = await conn.ExecuteAsync(sql, new
                    {
                        dto.RoleName,
                        dto.Slug,
                        dto.RoleType,
                        Id = roleId
                    }, localTransaction);

                    if (transaction == null)
                        localTransaction.Commit();

                    return affected > 0;
                }
                catch
                {
                    if (transaction == null)
                        localTransaction.Rollback();

                    throw;
                }
            },
            () => Task.FromResult(false)
        );
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
            INSERT INTO role_scopes (role_id, scope_id)
            VALUES (@RoleId, @ScopeId)
            ON CONFLICT DO NOTHING;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        var affected = await conn.ExecuteAsync(sql, new { RoleId = roleId, ScopeId = scopeId }, transact);

        return affected > 0;
    }

    public async Task<bool> RemoveScopeFromRoleAsync(Guid roleId, Guid scopeId, IDbTransaction? transaction = null)
    {
        const string sql = @"
            DELETE FROM role_scopes
            WHERE role_id = @RoleId AND scope_id = @ScopeId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? conn.BeginTransaction();
        var affected = await conn.ExecuteAsync(sql, new { RoleId = roleId, ScopeId = scopeId }, transact);

        return affected > 0;
    }

    public async Task<IEnumerable<int>> GetScopesInRoleAsync(int roleId)
    {
        const string sql = @"
            SELECT s.scope_id
            FROM scopes s
            JOIN role_scopes trs ON s.scope_id = trs.scope_id
            WHERE trs.role_id = @RoleId;
        ";

        using var conn = await connectionFactory.CreateConnectionAsync();

        return await conn.QueryAsync<int>(sql, new { RoleId = roleId });
    }
}