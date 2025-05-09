using System.Security.Claims;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Tenants;
using FastEndpoints;
using FluentValidation.Results;

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
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var refreshToken = User.FindFirstValue("refresh_token")!;
        
        var session = await tenantService.RefreshSessionAsync(refreshToken);

        await session.Match(async s =>
            {
                _loggerService.LogEvent(AuthEventType.Logout, s.TenantId.ToString());
                await SendAsync(session,cancellation:ct);
            },
            async () =>
            {
                AddError("invalid_payload","something went wrong");
                await SendErrorsAsync(400,ct);
            });
    }
}