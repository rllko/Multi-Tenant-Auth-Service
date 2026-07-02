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
    
        Summary(s =>
        {
            s.Summary = "List my teams";
            s.Description = "Returns the teams the authenticated tenant belongs to. Use the team id for all /teams/{teamId}/... calls. Bearer auth.";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var result = await teamsService.GetTeamsForUserAsync(session.TenantId);

        await SendAsync(result.Match(team => { return team; },
            () => { return []; }), cancellation: ct);
    }
}