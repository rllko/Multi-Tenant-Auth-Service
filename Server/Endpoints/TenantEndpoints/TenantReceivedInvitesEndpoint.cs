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
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var teams = await _inviteService.GetInvitesByTenantIdAsync(session.TenantId);

        await SendOkAsync(teams, ct);
    }
}