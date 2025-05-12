using Authentication.Attributes;
using Authentication.Models;
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
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("teamId");

        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var tenants = await _teamService.GetTenantInTeamAsync(teamId, memberId);
        await SendOkAsync(tenants, ct);
    }
}