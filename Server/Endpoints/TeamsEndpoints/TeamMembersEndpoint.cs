using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class GetTeamMembersEndpoint : EndpointWithoutRequest<IEnumerable<TenantDto>>
{
    private readonly ITeamService _teamService;

    public GetTeamMembersEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/members");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresPermissionAttribute("team.fetch_team_members")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var articleID = Route<Guid>("teamId");
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var tenants = await _teamService.GetTenantsInTeamAsync(articleID);
        await SendOkAsync(tenants, ct);
    }
}

public record GetTeamMembersRequest(Guid TeamId);