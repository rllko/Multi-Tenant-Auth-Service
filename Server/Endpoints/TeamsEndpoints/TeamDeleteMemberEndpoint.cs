using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Teams;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamDeleteMemberEndpoint : EndpointWithoutRequest<IEnumerable<TenantDto>>
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly ITeamService _teamService;

    public TeamDeleteMemberEndpoint(ITeamService teamService, IActivityLoggerService activityLogger)
    {
        _teamService = teamService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Delete("/teams/{teamId:guid}/members/{memberId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.kick")));
    
        Summary(s =>
        {
            s.Summary = "Remove a team member";
            s.Description = "Removes the tenant from the team. Bearer auth; requires the team.kick scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["memberId"] = "Tenant id of the member (GUID)";
            s.Response(200, "Member removed");
            s.Response(400, "Member not in team");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("memberId");

        var tenants = await _teamService.RemoveUserFromTeamAsync(teamId, memberId);

        if (tenants)
        {
            var session = HttpContext.Items["Session"] as TenantSessionInfo;
            _activityLogger.LogEvent(ActivityEventType.MemberRemoved, memberId.ToString(),
                session!.TenantId.ToString(), new { TeamId = teamId });

            await SendOkAsync(ct);
        }
        else
        {
            await SendErrorsAsync(cancellation: ct);
        }
    }
}