using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Scopes;

public class ScopeService(IDbConnectionFactory connectionFactory) : IScopeService
{
    public async Task<Option<Scope>> GetScopeByIdAsync(Guid scopeId)
    {
        const string sql = "SELECT * FROM scopes WHERE scope_id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var scope = await conn.QueryFirstOrDefaultAsync<Scope>(sql, new { Id = scopeId });
        return scope is null ? Option<Scope>.None : Option<Scope>.Some(scope);
    }

    public async Task<IEnumerable<Scope>> GetAllScopesAsync()
    {
        const string sql = "SELECT * FROM scopes;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QueryAsync<Scope>(sql);
    }

    public async Task<bool> DeleteScopeAsync(Guid scopeId, IDbTransaction? transaction = null)
    {
        const string sql = "DELETE FROM scopes WHERE scope_id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = scopeId });
        return affected > 0;
    }
    
    public async Task<Scope> CreateScopeAsync(ScopeCreateDto dto, IDbTransaction? transaction = null)
    {
        const string sql = @"
        INSERT INTO scopes (scope_name, scope_type, slug, created_by, impact_level_id, category_id)
        VALUES (@ScopeName, @ScopeType, @Slug, @CreatedBy, @ImpactLevelId, @CategoryId)
        RETURNING *;
    ";

        using var conn = await connectionFactory.CreateConnectionAsync();
        return await conn.QuerySingleAsync<Scope>(sql, dto);
    }
}