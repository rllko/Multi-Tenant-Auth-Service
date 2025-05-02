using Authentication.HostedServices;
using Authentication.Models.Entities;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Tenants;
using FastEndpoints;
using FastEndpoints.Security;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

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
    public required TenantDto user { get; set; }

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
        var result = await _tenantService.LoginAsync(req.Email, req.Password, "", "");

        await result.Match(
            async response =>
            {
                var jwtToken = JwtBearer.CreateToken(o =>
                {
                    o.SigningKey = Environment.GetEnvironmentVariable(EnvironmentVariableService.SignKeyName)!;
                    o.ExpireAt = response.session.Expires;
                    o.User.Claims.Add(("sub", response.session.TenantId.ToString()));
                    o.User.Claims.Add(("access_token", response.session.SessionToken));
                });

                _loggerService.LogEvent(AuthEventType.LoginSuccess, response.session.TenantId.ToString(), req);

                await SendOkAsync(new LoginResponse
                {
                    token = jwtToken,
                    user = response.tenant.ToDto(),
                    expires_in = "3600",
                    token_type = "Bearer"
                }, ct);
            },
            fail =>
            {
                _loggerService.LogEvent(AuthEventType.LoginSuccess, req.Email, req);
                ThrowError("The supplied credentials are invalid!");
                return Task.CompletedTask;
            });
    }
}