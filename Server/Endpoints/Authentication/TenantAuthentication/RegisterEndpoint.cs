using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

public class TenantRegisterEndpoint(ITenantService tenantService, IAuthLoggerService loggerService)
    : Endpoint<TenantRegisterRequestDTO>
{
    private readonly ITenantService _tenantService = tenantService;
    private IAuthLoggerService _loggerService { get; } = loggerService;

    public override void Configure()
    {
        DontThrowIfValidationFails();
        AllowAnonymous();
        EnableAntiforgery();

        Post("/auth/tenant/register");
        Throttle(5, 60);
    
        Summary(s =>
        {
            s.Summary = "Register a tenant account";
            s.Description = "Creates a dashboard account from email, name, and password. Anonymous; rate limited.";
            s.Response(200, "Account created");
            s.Response<ErrorResponse>(400, "Validation errors (email taken, weak password, ...)");
        });
    }

    public override async Task HandleAsync(TenantRegisterRequestDTO req, CancellationToken ct)
    {
        var result = await _tenantService.CreateTenantAsync(req.Email, req.Name, req.Password);

        await result.Match(
            _ => SendOkAsync(ct),
            error => SendAsync(error.Errors, 400, ct)
        );
    }
}