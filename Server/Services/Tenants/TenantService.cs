using System.Text.Json;
using Authentication.Database;
using Authentication.Models;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt.Async.Linq;
using Redis.OM;
using Redis.OM.Searching;

namespace Authentication.Services.Tenants;

public class TenantService(RedisConnectionProvider provider, IDbConnectionFactory connectionFactory) : ITenantService
{
    private readonly TimeSpan _sessionTtl = TimeSpan.FromHours(1);
    private readonly RedisCollection<TenantSessionInfo> _sessions = (RedisCollection<TenantSessionInfo>)provider
        .RedisCollection<TenantSessionInfo>();
    private readonly RedisConnectionProvider _provider = provider;

    public async Task<string?> LoginAsync(string username, string password, string ip, string userAgent)
    {
        var tenant = await AuthenticateUser(username, password);
        if (tenant == null) return null;
        
        var token = Guid.NewGuid().ToString("N");
        var createdAt = DateTime.UtcNow;

        var session = new TenantSessionInfo()
        {
            SessionToken = token,
            TenantId = tenant.Id,
            Ip = ip,
            UserAgent = userAgent,
            Created = createdAt,
            Expires = createdAt.Add(_sessionTtl)
        };

        var key = $"session:{token}";
        var indexKey = $"user-sessions:{tenant}:{tenant.Id.ToString()}";
        
        await _sessions.InsertAsync(session,_sessionTtl);
        
        return token;
    }

    public async Task<TenantSessionInfo?> ValidateSessionAsync(string sessionToken)
    {
        return await _sessions.FindByIdAsync(sessionToken);
    }

    public async Task<bool> RefreshSessionAsync(string sessionToken)
    {
        var session = await _sessions.FindByIdAsync(sessionToken);
        if (session is null) return false;

        session.Expires = DateTime.UtcNow.AddHours(1);
        await _sessions.UpdateAsync(session,_sessionTtl);

        return true;
    }

    public async Task LogoutAsync(TenantSessionInfo sessionToken)
    {
        await _sessions.DeleteAsync(sessionToken);
    }

    public async Task<IEnumerable<TenantSessionInfo>> GetActiveSessionsAsync(Guid tenantId)
    {
        return await _sessions
            .Where(x => x.TenantId == tenantId)
            .ToListAsync();
    }

    public async Task RevokeAllOtherSessionsAsync(string currentToken, Guid tenantId)
    {
        var sessions = await _sessions
            .Where(x => x.TenantId == tenantId && x.SessionToken != currentToken)
            .ToListAsync();

        foreach (var s in sessions)
            await _sessions.DeleteAsync(s);
    }

    private async Task<Tenant?> AuthenticateUser(string email, string password)
    {
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)) return null;

        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "SELECT * FROM tenants WHERE email = @email AND activated_at is not null";
        var result = await connection.QuerySingleOrDefaultAsync<Tenant>(query, new { email });

        var isPasswordValid = PasswordHashing.ValidatePassword(password, result?.Password);

        return result;
    }
}