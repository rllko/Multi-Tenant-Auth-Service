using Authentication.Database;
using Authentication.Endpoints.Authentication.TenantAuthentication;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.Services.Logger;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Dapper;
using FluentValidation.Results;
using LanguageExt;
using Redis.OM;
using Redis.OM.Searching;

namespace Authentication.Services.Tenants;

public class TenantService(
    RedisConnectionProvider provider,
    IDbConnectionFactory connectionFactory,
    IAuthLoggerService authLoggerService,
    ILoggerService loggerService) : ITenantService
{
    private readonly RedisConnectionProvider _provider = provider;

    private readonly RedisCollection<TenantSessionInfo> _sessions =
        (RedisCollection<TenantSessionInfo>)provider.RedisCollection<TenantSessionInfo>();

    private readonly TimeSpan _sessionTtl = TimeSpan.FromHours(1);
    private readonly TimeSpan _refreshSessionTtl = TimeSpan.FromDays(6);

    public async Task<Result<TenantLoginResponse, ValidationFailed>> LoginAsync(string email, string password,
        string ip,
        string tenantAgent)
    {
        var result = await AuthenticateTenant(email, password);

        if (result.IsNone)
        {
            var er = new ValidationFailure(
                "error",
                "invalid Tenantname or password");
            return new ValidationFailed(er);
        }

        if (result.Case is not Tenant tenant)
        {
            var er = new ValidationFailure(
                "error",
                "invalid tenant data");
            return new ValidationFailed(er);
        }
        
        var session = await CreateSessionAsync(tenant, ip, tenantAgent);

        return new TenantLoginResponse
        {
            session = session,
            tenant = tenant,
        };
    }

    private async Task<TenantSessionInfo> CreateSessionAsync(Tenant tenant,string ip,string tenantAgent)
    {
        var sessionToken = Guid.NewGuid().ToString("N");
        var refreshToken = Guid.NewGuid().ToString("N");
        var createdAt = DateTime.UtcNow;

        var session = new TenantSessionInfo
        {
            TenantId = tenant.Id,
            Email = tenant.Email ?? string.Empty,
            Ip = ip,
            UserAgent = tenantAgent,
            Created = createdAt,
            SessionToken = sessionToken,
            Expires = createdAt.Add(_sessionTtl),
            RefreshToken = refreshToken,
            RefreshExpires = createdAt.Add(_refreshSessionTtl),
        };

        await _sessions.InsertAsync(session, _refreshSessionTtl);
        return session;
    }
    

    public async Task<TenantSessionInfo?> GetSessionAsync(string sessionToken) =>
      await _sessions.FirstOrDefaultAsync(session => session.SessionToken == sessionToken);
    
    
    public async Task<Option<TenantSessionInfo>> RefreshSessionAsync(string refreshToken)
    {
        var session = await _sessions.FirstOrDefaultAsync(x => x.RefreshToken == refreshToken);
        if (session is null) return null;

        session.SessionToken = Guid.NewGuid().ToString("N");

        session.Expires = session.Expires.AddHours(1);
        session.RefreshExpires = session.RefreshExpires.AddDays(6);

        await _sessions.UpdateAsync(session);

        return session;
    }


    public async Task<bool> LogoutAsync(string sessionToken)
    {
        var session = await _sessions.FirstOrDefaultAsync(x => x.SessionToken == sessionToken);

        if (session is null) return false;

        await _sessions.DeleteAsync(session);
        return true;
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


    private async Task<Option<Tenant>> AuthenticateTenant(string email, string password)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "SELECT * FROM tenants WHERE email like @email AND activated_at is not null";
        var result = await connection.QuerySingleOrDefaultAsync<Tenant>(query, new { email });

        var isPasswordValid = PasswordHashing.ValidatePassword(password, result?.Password);

        if (isPasswordValid)
        {
            authLoggerService.LogEvent(AuthEventType.LoginSuccess, result!.Id.ToString());
            return result;
        }

        return null;
    }
}