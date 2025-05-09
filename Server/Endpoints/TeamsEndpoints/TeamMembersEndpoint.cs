using Authentication.Models.Entities;
using Authentication.Services.Teams;
using FastEndpoints;

public class GetTeamMembersEndpoint : EndpointWithoutRequest<IEnumerable<TenantDto>>
{
    private readonly ITeamService _teamService;

    public GetTeamMembersEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
#warning add permission here
        Get("/teams/{teamId:guid}/members");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var articleID = Route<Guid>("teamId");
        var tenants = await _teamService.GetTenantsInTeamAsync(articleID);
        await SendOkAsync(tenants, ct);
    }
}

public record GetTeamMembersRequest(Guid TeamId);