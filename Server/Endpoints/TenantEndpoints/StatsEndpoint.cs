using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class StatsEndpoint : EndpointWithoutRequest
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
        var context = HttpContext.User.Claims.First(x => x.Type == "access_token");
        await SendOkAsync(new { yuh = context.Value }, ct);
    }
}