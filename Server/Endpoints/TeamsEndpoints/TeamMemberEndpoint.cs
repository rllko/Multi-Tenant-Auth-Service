using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class GetTeamMemberEndpoint : EndpointWithoutRequest<TenantDto>
{
    private readonly ITeamService _teamService;

    public GetTeamMemberEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/members/{memberId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.fetch_team_members")));
    
        Summary(s =>
        {
            s.Summary = "Get a team member";
            s.Description = "Returns one member of the team (id, name, email, role). Bearer auth; requires the team.fetch_team_members scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["memberId"] = "Tenant id of the member (GUID)";
            s.Response<TenantDto>(200, "The member: { id, name, email, role }");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("memberId");

        var tenants = await _teamService.GetTenantInTeamAsync(teamId, memberId);
        await SendOkAsync(tenants, ct);
    }
}