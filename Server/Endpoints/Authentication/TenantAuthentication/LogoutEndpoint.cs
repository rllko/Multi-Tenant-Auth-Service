using System.Security.Claims;
using Authentication.Logging.Enums;
using Authentication.Logging.Interfaces;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.Tenants;

public class TenantLogoutEndpoint(ITenantService tenantService,IAuthLoggerService loggerService) : EndpointWithoutRequest
{
    public IAuthLoggerService _loggerService { get; } = loggerService;

    public override void Configure()
    {
        Claims("access_token");
        Delete("tenant/sessions");
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
        var result = await tenantService.LogoutAsync(accessToken);

        if (result is true)
        {
            _loggerService.LogEvent(AuthEventType.Logout,session.TenantId.ToString());
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}