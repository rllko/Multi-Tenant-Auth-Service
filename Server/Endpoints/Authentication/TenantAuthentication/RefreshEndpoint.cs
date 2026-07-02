using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

public class TenantRefreshEndpoint(ITenantService tenantService, IAuthLoggerService loggerService)
    : EndpointWithoutRequest
{
    private IAuthLoggerService _loggerService { get; } = loggerService;

    public override void Configure()
    {
        Claims("refresh_token");
        Post("auth/tenant/refresh");

        Throttle(
            5,
            60
        );

        PreProcessor<TenantProcessor<EmptyRequest>>();
    
        Summary(s =>
        {
            s.Summary = "Refresh the tenant session";
            s.Description = "Refreshes the tenant session using the refresh token claim and returns the renewed session info.";
            s.Response<TenantSessionInfo>(200, "Renewed session info");
            s.Response<ErrorResponse>(400, "Refresh token invalid or expired");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        if (session == null)
        {
            AddError("Session expired");
            await SendErrorsAsync(cancellation: ct);

            return;
        }

        var refreshResult = await tenantService.RefreshSessionAsync(session.RefreshToken);

        await refreshResult.Match(async s =>
            {
                _loggerService.LogEvent(AuthEventType.Logout, s.TenantId.ToString());
                await SendAsync(session, cancellation: ct);
            },
            async () =>
            {
                AddError("invalid_payload", "something went wrong");
                await SendErrorsAsync(400, ct);
            });
    }
}