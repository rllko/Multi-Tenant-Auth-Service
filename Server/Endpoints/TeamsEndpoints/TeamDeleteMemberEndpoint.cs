using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamDeleteMemberEndpoint : EndpointWithoutRequest<IEnumerable<TenantDto>>
{
    private readonly ITeamService _teamService;

    public TeamDeleteMemberEndpoint(ITeamService teamService)
    {
        _teamService = teamService;
    }

    public override void Configure()
    {
        Delete("/teams/{teamId:guid}/members/{memberId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.kick")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("memberId");

        var tenants = await _teamService.RemoveUserFromTeamAsync(teamId, memberId);

        if (tenants)
            await SendOkAsync(ct);
        else
            await SendErrorsAsync(cancellation: ct);
    }
}