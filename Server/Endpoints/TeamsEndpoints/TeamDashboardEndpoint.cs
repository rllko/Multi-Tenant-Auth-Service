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
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var dashboard = await dashboardService.GetDashboardAsync(teamId);

        await SendOkAsync(dashboard, ct);
    }
}
