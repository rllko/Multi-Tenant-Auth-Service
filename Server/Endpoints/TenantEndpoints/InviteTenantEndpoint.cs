using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Invites;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.InviteEndpoints;

public class InviteTenantEndpoint : Endpoint<TenantInviteCreateDto>
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IInviteService _inviteService;

    public InviteTenantEndpoint(IInviteService inviteService, IActivityLoggerService activityLogger)
    {
        _inviteService = inviteService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Post("/teams/{teamId:guid}/members");
        PreProcessor<TenantProcessor<TenantInviteCreateDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.invite")));
    }

    public override async Task HandleAsync(TenantInviteCreateDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var invites = await _inviteService.CreateInviteAsync(req.Email, req.InviteMessage, teamId, session.TenantId);

        await invites.Match(
            async invite =>
            {
                _activityLogger.LogEvent(ActivityEventType.UserInvited, req.Email, session!.TenantId.ToString(),
                    new { TeamId = teamId });

                await SendOkAsync(invite, ct);
            },
            async () =>
            {
                AddError("User doesnt exist.");
                await SendErrorsAsync(cancellation: ct);
            });
    }
}