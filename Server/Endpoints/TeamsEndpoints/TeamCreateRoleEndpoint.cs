using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamCreateRoleEndpoint : EndpointWithoutRequest
{
    private readonly ITeamService _teamService;

    public TeamCreateRoleEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
#warning add permission here
        Post("/teams/{teamId:guid}/roles");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _teamService.GetTeamRolesAsync(teamId);

        teams.Match(
            async roles => await SendOkAsync(ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            }
        );
    }
}