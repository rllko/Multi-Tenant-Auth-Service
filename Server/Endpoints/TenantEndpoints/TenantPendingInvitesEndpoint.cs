using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantPendingInvitesEndpoint : EndpointWithoutRequest<IEnumerable<TenantInviteDto>>
{
    private readonly IInviteService _inviteService;

    public TenantPendingInvitesEndpoint(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    public override void Configure()
    {
        Get("teams/invites/pending");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
    
        Summary(s =>
        {
            s.Summary = "List my pending invites";
            s.Description = "Returns invitations addressed to the authenticated tenant that are still pending. Bearer auth.";
            s.Response<IEnumerable<TenantInviteDto>>(200, "Array of invites: { inviteToken, createdBy, createdByEmail, teamName, status, createdAt, expiresAt }");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _inviteService.GetInvitesPendingByTenantIdAsync(session.TenantId);

        await SendOkAsync(teams, ct);
    }
}