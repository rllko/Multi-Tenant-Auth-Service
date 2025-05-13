using System.Data;
using Authentication.Database;
using Authentication.Endpoints.Authentication.TenantAuthentication;
using Authentication.Endpoints.TeamsEndpoints;
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
    private readonly TimeSpan _refreshSessionTtl = TimeSpan.FromDays(6);

    private readonly RedisCollection<TenantSessionInfo> _sessions =
        (RedisCollection<TenantSessionInfo>)provider.RedisCollection<TenantSessionInfo>();

    private readonly TimeSpan _sessionTtl = TimeSpan.FromHours(1);

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
            tenant = tenant
        };
    }


    public async Task<TenantSessionInfo?> GetSessionAsync(string sessionToken)
    {
        return await _sessions.FirstOrDefaultAsync(session => session.SessionToken == sessionToken);
    }


    public async Task<Option<TenantDto>> GetTenantByEmailAsync(string email)
    {
        var sql = "SELECT * FROM tenants WHERE email like @Email;";
        using var conn = await connectionFactory.CreateConnectionAsync();

        var team = await conn.QueryFirstOrDefaultAsync<TenantDto>(sql, new { Email = email });

        return team == null ? Option<TenantDto>.None : Option<TenantDto>.Some(team);
    }

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

    public async Task<Option<TenantDto>> GetTenantByIdAsync(Guid teamId)
    {
        var sql = "SELECT * FROM tenants WHERE id = @Id;";
        using var conn = await connectionFactory.CreateConnectionAsync();

        var team = await conn.QueryFirstOrDefaultAsync<TenantDto>(sql, new { Id = teamId });

        return team == null ? Option<TenantDto>.None : Option<TenantDto>.Some(team);
    }


    public async Task<Result<Unit, ValidationFailed>> CreateTenantAsync(string email, string name, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(password))
            return new ValidationFailed(new ValidationFailure("input", "Email, name and password are required"));

        using var connection = await connectionFactory.CreateConnectionAsync();

        var existing = await connection.QueryFirstOrDefaultAsync<Tenant>(
            "SELECT * FROM tenants WHERE email = @Email OR name = @Name", new { Email = email, Name = name });

        if (existing is not null)
        {
            var conflictField = existing.Email == email ? "email" : "name";

            return new ValidationFailed(new ValidationFailure(conflictField, "Already in use"));
        }

        var hashedPassword = PasswordHashing.HashPassword(password);

        const string insertSql = @"
        INSERT INTO tenants (email, name, password,activated_at)
        VALUES (@Email, @Name, @Password,NOW());
    ";

        await connection.ExecuteAsync(insertSql, new
        {
            Email = email,
            Name = name,
            Password = hashedPassword
        });

        return Unit.Default;
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

    public async Task<bool> UpdateTenantRoleAsync(UpdateTenantRoleDto req, Guid tenantGuid, Guid teamGuid,
        IDbTransaction? transaction = null)
    {
        using var conn = await connectionFactory.CreateConnectionAsync();

        var transact = transaction ?? conn.BeginTransaction();

        const string teamSql = @"
            select created_by from teams
            WHERE teams = @TeamGuid;
        ";

        var teamOwner = await conn.QueryFirstOrDefaultAsync<Guid>(teamSql,
            new { TeamGuid = teamGuid }, transact);

        if (teamOwner == tenantGuid) return false;

        const string sql = @"
            UPDATE team_tenants
            SET role = @RoleId
            WHERE tenant = @TenantGuid and team = @TeamId;
        ";

        var affected = await conn.ExecuteAsync(sql,
            new { RoleId = req.roleId, TenantGuid = tenantGuid, TeamGuid = teamGuid }
            , transact);

        transact.Commit();

        return affected > 0;
    }


    private async Task<TenantSessionInfo> CreateSessionAsync(Tenant tenant, string ip, string tenantAgent)
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
            RefreshExpires = createdAt.Add(_refreshSessionTtl)
        };

        await _sessions.InsertAsync(session, _refreshSessionTtl);

        return session;
    }


    private async Task<Option<Tenant>> AuthenticateTenant(string email, string password)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

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