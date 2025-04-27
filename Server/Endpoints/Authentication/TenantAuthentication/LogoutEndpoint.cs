using System.Security.Claims;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.Tenants;

public class TenantLogoutEndpoint(ITenantService tenantService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Claims("access_token");
        Delete("tenant/sessions");
        Throttle(
            10,
            60
        );
        PreProcessor<TenantProcessor<EmptyRequest>>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accessToken = User.FindFirstValue("access_token")!;

        var result = await tenantService.LogoutAsync(accessToken);

        if (result is true)
        {
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}