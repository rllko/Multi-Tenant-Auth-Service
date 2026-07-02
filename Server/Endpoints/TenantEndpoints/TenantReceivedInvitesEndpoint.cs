using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantReceivedInvitesEndpoint : EndpointWithoutRequest<IEnumerable<TenantInviteDto>>
{
    private readonly IInviteService _inviteService;

    public TenantReceivedInvitesEndpoint(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    public override void Configure()
    {
        Get("teams/invites/received");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
    
        Summary(s =>
        {
            s.Summary = "List my received invites";
            s.Description = "Returns every invitation addressed to the authenticated tenant across all teams, any status. Bearer auth.";
            s.Response<IEnumerable<TenantInviteDto>>(200, "Array of invites: { inviteToken, createdBy, createdByEmail, teamName, status, createdAt, expiresAt }");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _inviteService.GetInvitesByTenantIdAsync(session.TenantId);

        await SendOkAsync(teams, ct);
    }
}