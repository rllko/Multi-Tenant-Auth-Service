using System.Security.Claims;
using Authentication.Models.Entities;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.Tenants;

public class TenantLogoutEndpoint(ITenantService tenantService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Claims("access_token");
        Delete("/sessions");
        Throttle(
            10,
            60
        );
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        string accessToken = User.FindFirstValue("access_token")!;

        var result = await tenantService.LogoutAsync(accessToken);

        if (result is true)
        {
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}