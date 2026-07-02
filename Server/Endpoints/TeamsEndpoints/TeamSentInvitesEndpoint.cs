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
    
        Summary(s =>
        {
            s.Summary = "List invites sent for a team";
            s.Description = "Returns the team's outgoing invites with sender name/email, status (pending/accepted/declined/expired/revoked), and expiry. Bearer auth; requires the team.invite scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Response<IEnumerable<TenantInviteDto>>(200, "Array of invites: { inviteToken, createdBy, createdByEmail, teamName, status, createdAt, expiresAt }");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var invites = await _inviteService.GetInvitesSentByTeamAsync(teamId);

        await SendOkAsync(invites, ct);
    }
}
