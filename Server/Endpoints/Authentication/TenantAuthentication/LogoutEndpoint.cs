using System.Security.Claims;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Tenants;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

public class TenantLogoutEndpoint(ITenantService tenantService, IAuthLoggerService loggerService)
    : EndpointWithoutRequest
{
    public IAuthLoggerService _loggerService { get; } = loggerService;

    public override void Configure()
    {
        Claims("access_token");
        Delete("auth/tenant/");
        Throttle(
            5,
            60
        );
        PreProcessor<TenantProcessor<EmptyRequest>>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accessToken = User.FindFirstValue("access_token")!;

        var session = await tenantService.GetSessionAsync(accessToken);

        if (session == null)
        {
            AddError("expired_license", "Your license is expired");
            await SendErrorsAsync(400, ct);
            return;
        }
        
        var result = await tenantService.LogoutAsync(accessToken);

        if (result is true)
        {
            _loggerService.LogEvent(AuthEventType.Logout, session.TenantId.ToString());
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}