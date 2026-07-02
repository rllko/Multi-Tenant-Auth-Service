using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantCancelInviteEndpoint : EndpointWithoutRequest
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IInviteService _inviteService;

    public TenantCancelInviteEndpoint(IInviteService inviteService, IActivityLoggerService activityLogger)
    {
        _inviteService = inviteService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Post("/teams/invites/{inviteToken}/cancel");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
    
        Summary(s =>
        {
            s.Summary = "Cancel a sent invite";
            s.Description = "Revokes a pending invitation. Only the tenant that sent the invite may cancel it. Bearer auth.";
            s.Params["inviteToken"] = "Invite token from the sent invites listing";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        var token = Route<string>("inviteToken");

        if (token == null)
        {
            AddError("no token provided");
            await SendErrorsAsync(cancellation: ct);

            return;
        }

        var invite = await _inviteService.GetInviteByTokenAsync(token);

        await invite.Match(async inv =>
            {
                // only the tenant that sent the invite may cancel it
                if (inv.CreatedBy != session!.TenantId)
                {
                    await SendForbiddenAsync(ct);

                    return;
                }

                var revoked = await _inviteService.RevokeInviteAsync(token);

                if (revoked)
                {
                    _activityLogger.LogEvent(ActivityEventType.InviteRevoked, inv.TenantId.ToString(),
                        session.TenantId.ToString(), new { inv.TeamId });

                    await SendOkAsync(ct);
                }
                else
                {
                    AddError("invite is no longer pending");
                    await SendErrorsAsync(cancellation: ct);
                }
            }, async () => await SendForbiddenAsync(ct)
        );
    }
}
