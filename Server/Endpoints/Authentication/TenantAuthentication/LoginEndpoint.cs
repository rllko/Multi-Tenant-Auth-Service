using Authentication.Common;
using Authentication.HostedServices;
using Authentication.Logging.Enums;
using Authentication.Logging.Interfaces;
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
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginResponse
{
    public required string token { get; set; }
    public required string expires_in { get; set; }
    public required string token_type { get; set; }
}

public class LoginEndpoint : Endpoint<LoginRequest>
{
    private readonly IAuthLoggerService _loggerService;
    private readonly ITenantService _tenantService;

    public LoginEndpoint(IAuthLoggerService loggerService, ITenantService tenantService)
    {
        _loggerService = loggerService;
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Post("/auth/tenant/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
#warning do this later
        var result = await _tenantService.LoginAsync(req.Email, req.Password, "", "");

        await result.Match(
            async tenantSession =>
            {
                var jwtToken = JwtBearer.CreateToken(o =>
                {
                    o.SigningKey = Environment.GetEnvironmentVariable(EnvironmentVariableService.SignKeyName)!;
                    o.ExpireAt = tenantSession.Expires;
                    o.User.Claims.Add(("sub", tenantSession.TenantId.ToString()));
                    o.User.Claims.Add(("access_token", tenantSession.SessionToken));
                });
                
                _loggerService.LogEvent(AuthEventType.LoginSuccess,tenantSession.TenantId.ToString(),req);

                await SendOkAsync(new LoginResponse
                {
                    token = jwtToken,
                    expires_in = "3600",
                    token_type = "Bearer"
                }, cancellation: ct);
            },
            fail =>
            {
                _loggerService.LogEvent(AuthEventType.LoginSuccess,req.Email,req);
                ThrowError("The supplied credentials are invalid!");
                return Task.CompletedTask;
            });
    }
}