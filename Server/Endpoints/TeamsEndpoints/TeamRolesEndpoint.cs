using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamRolesEndpoint : EndpointWithoutRequest<IEnumerable<RoleDto>>
{
    private readonly ITeamService _teamService;

    public TeamRolesEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/roles");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.fetch_team_roles")));
    
        Summary(s =>
        {
            s.Summary = "List team roles";
            s.Description = "Returns the team's roles including each role's assigned scope ids. Bearer auth; requires the team.fetch_team_roles scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Response(200, "Array of roles: { roleId, roleName, description, createdBy, scopes: int[] }");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var teams = await _teamService.GetTeamRolesAsync(teamId);

        teams.Match(
            async roles => await SendOkAsync(roles, ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            }
        );
    }
}