using Authentication.Common;
using Authentication.Models;
using Authentication.Services;
using Authentication.Services.Tenants;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Tenants;
using FastEndpoints;
using Redis.OM;
using Redis.OM.Searching;

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class LoginResponse
{
    public string access_token { get; set; }
    public string expires_in { get; set; }
    public string token_type { get; set; }
    public string session_state { get; set; }
}

public class LoginEndpoint : Endpoint<LoginRequest>
{
    private readonly IRedisCollection<TenantSessionInfo> _sessions;
    private readonly RedisConnectionProvider _provider;
    private readonly ITenantService _tenantService;

    public LoginEndpoint(RedisConnectionProvider provider,ITenantService tenantService)
    {
        _provider = provider;
        _tenantService = tenantService;
        _sessions = provider.RedisCollection<TenantSessionInfo>();
    }

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        #warning do this later
        var result = await _tenantService.LoginAsync(req.Username, req.Password,"", "");

        await result.Match(
            async tenantSession =>
            {
                var jwtToken = JwtBearer.CreateToken(o =>
                {
                    o.SigningKey = Environment.GetEnvironmentVariable("SYM_KEY")!;
                    o.ExpireAt = tenantSession.Expires;
                    o.User.Claims.Add(("sub", tenantSession.TenantId.ToString()));
                    o.User.Claims.Add(("access_token", tenantSession.SessionToken));
                });

                await SendAsync(new LoginResponse{
                    access_token = jwtToken,
                    expires_in = tenantSession.Expires.ToEpoch().ToString(),
                    token_type = "Bearer",
                    session_state = tenantSession.SessionToken
                }, cancellation: ct);
            },
            fail =>
            {
                ThrowError(fail.Errors.First());
                return Task.CompletedTask;
            });
    }
}