using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantSentInvitesEndpoint : EndpointWithoutRequest<IEnumerable<TenantInviteDto>>
{
    private readonly IInviteService _inviteService;

    public TenantSentInvitesEndpoint(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    public override void Configure()
    {
        Get("teams/invites/sent");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("global.invite_management")));
    
        Summary(s =>
        {
            s.Summary = "List invites I sent";
            s.Description = "Returns every invitation created by the authenticated tenant across all teams. Prefer GET /teams/{teamId}/invites/sent for team-scoped listings. Bearer auth; requires the global.invite_management scope.";
            s.Response<IEnumerable<TenantInviteDto>>(200, "Array of invites: { inviteToken, createdBy, createdByEmail, teamName, status, createdAt, expiresAt }");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _inviteService.GetInvitesSentByTenantIdAsync(session.TenantId);

        await SendOkAsync(teams, ct);
    }
}