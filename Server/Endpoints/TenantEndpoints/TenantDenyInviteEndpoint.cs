using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantDenyInviteEndpoint : EndpointWithoutRequest
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IInviteService _inviteService;

    public TenantDenyInviteEndpoint(IInviteService inviteService, IActivityLoggerService activityLogger)
    {
        _inviteService = inviteService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Post("/teams/invites/{inviteToken}/decline");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
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
                if (inv.TenantId != session.TenantId)
                {
                    await SendForbiddenAsync(ct);

                    return;
                }

                var teams = await _inviteService.DeclineInviteAsync(token);

                if (teams)
                {
                    _activityLogger.LogEvent(ActivityEventType.InviteDeclined, inv.TenantId.ToString(),
                        session!.TenantId.ToString(), new { inv.TeamId });

                    await SendOkAsync(ct);
                }
                else
                {
                    await SendErrorsAsync(cancellation: ct);
                }
            }, async () => await SendForbiddenAsync(ct)
        );
    }
}