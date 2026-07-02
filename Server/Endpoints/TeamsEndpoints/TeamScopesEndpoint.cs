using Authentication.Attributes;
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
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.fetch_team_roles")));
    
        Summary(s =>
        {
            s.Summary = "List team permission scopes";
            s.Description = "Returns every permission scope assignable within the team (id, name, description, impact, resource). Bearer auth; requires the team.fetch_team_roles scope.";
            s.Params["teamId"] = "Team id (GUID)";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

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