using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamScopesEndpoint : EndpointWithoutRequest<IEnumerable<ScopeDto>>
{
    private readonly ITeamService _teamService;

    public TeamScopesEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/permissions");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresPermissionAttribute("team.fetch_team_roles")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _teamService.GetTeamScopesAsync(teamId);

        teams.Match(
            async scopes => await SendOkAsync(scopes, ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            });
    }
}