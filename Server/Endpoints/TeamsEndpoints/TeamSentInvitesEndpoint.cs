using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamSentInvitesEndpoint : EndpointWithoutRequest<IEnumerable<TenantInviteDto>>
{
    private readonly IInviteService _inviteService;

    public TeamSentInvitesEndpoint(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/invites/sent");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.invite")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var invites = await _inviteService.GetInvitesSentByTeamAsync(teamId);

        await SendOkAsync(invites, ct);
    }
}
