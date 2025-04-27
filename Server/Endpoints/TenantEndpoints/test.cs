using Authentication.Models;
using Authentication.RequestProcessors;
using FastEndpoints;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

public class test : EndpointWithoutRequest
{
    public override void Configure()
    {
        Claims("access_token");
        Get("/tenants/test");
        Throttle(
            10,
            60
        );
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var context = HttpContext.User.Claims.FirstOrDefault(x => x.Type == "access_token");
        await SendOkAsync(new { yuh = context.Value }, ct);
    }
}