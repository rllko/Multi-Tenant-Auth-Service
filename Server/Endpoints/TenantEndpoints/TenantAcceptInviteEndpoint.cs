using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantAcceptInviteEndpoint : EndpointWithoutRequest
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IInviteService _inviteService;

    public TenantAcceptInviteEndpoint(IInviteService inviteService, IActivityLoggerService activityLogger)
    {
        _inviteService = inviteService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Post("/teams/invites/{inviteToken}/accept");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
    
        Summary(s =>
        {
            s.Summary = "Accept a team invite";
            s.Description = "Accepts the invitation identified by its token and joins the team. Only the invited tenant may accept. Bearer auth.";
            s.Params["inviteToken"] = "Invite token from the invite listing";
            s.Response(200, "Joined the team");
            s.Response<ErrorResponse>(400, "Invite expired or already handled");
            s.Response(403, "Invite belongs to another tenant");
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
                if (inv.TenantId != session.TenantId)
                {
                    await SendForbiddenAsync(ct);

                    return;
                }

                var teams = await _inviteService.AcceptInviteAsync(token, inv.TeamId, inv.TenantId, inv.CreatedBy);

                if (teams)
                {
                    _activityLogger.LogEvent(ActivityEventType.InviteAccepted, inv.TenantId.ToString(),
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