using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Dashboard;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamDashboardEndpoint(IDashboardService dashboardService) : EndpointWithoutRequest<DashboardDto>
{
    public override void Configure()
    {
        Get("/teams/{teamId:guid}/dashboard");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.fetch_team_members")));
    
        Summary(s =>
        {
            s.Summary = "Team dashboard overview";
            s.Description = "Aggregated overview for the dashboard home: member/role counts, app counts by status, license stats and per-day issuance, pending invites, sign-ins in the last 24h, and recent activity. Bearer auth; requires the team.fetch_team_members scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Response<DashboardDto>(200, "{ members, roles, apps, appsInactive, licensesTotal, licensesActive, licensesPaused, pendingInvites, signInsLast24H, licensesPerDay: [{ date, count }], recentActivity: [{ description, type, timestamp, userName }] }");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var dashboard = await dashboardService.GetDashboardAsync(teamId);

        await SendOkAsync(dashboard, ct);
    }
}
