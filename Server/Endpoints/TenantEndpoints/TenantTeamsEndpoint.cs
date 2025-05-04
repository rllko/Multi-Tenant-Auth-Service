using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantTeamsEndpoint(ITeamService teamsService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Claims("access_token");
        Get("/teams");
        Throttle(
            20,
            60
        );
        PreProcessor<TenantProcessor<EmptyRequest>>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var result = await teamsService.GetTeamsForUserAsync(session.TenantId);

        await SendAsync(result.Match(team => { return team; },
            () => { return []; }), cancellation: ct);
    }
}