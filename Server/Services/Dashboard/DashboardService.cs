using Authentication.Services.Applications;
using Authentication.Services.Invites;
using Authentication.Services.Licenses;
using Authentication.Services.Logger;
using Authentication.Services.Teams;
using Dapper;

namespace Authentication.Services.Dashboard;

/// <summary>
///     Pure orchestration: gathers the team overview from the entity services.
///     Owns no entity queries of its own; the logger database reads are best-effort
///     because log persistence may not be available in every environment.
/// </summary>
public class DashboardService(
    ITeamService teamService,
    IApplicationService applicationService,
    ILicenseService licenseService,
    IInviteService inviteService,
    ILoggerService loggerService) : IDashboardService
{
    private const int LicenseHistoryDays = 30;
    private const int RecentActivityLimit = 8;

    public async Task<DashboardDto> GetDashboardAsync(Guid teamId)
    {
        var members = await teamService.CountTenantsInTeamAsync(teamId);
        var roles = await teamService.CountTeamRolesAsync(teamId);
        var appCounts = await applicationService.CountApplicationsByTeamAsync(teamId);
        var licenseStats = await licenseService.GetLicenseStatsByTeamAsync(teamId);
        var licensesPerDay = await licenseService.GetLicensesPerDayByTeamAsync(teamId, LicenseHistoryDays);
        var pendingInvites = await inviteService.CountPendingInvitesByTeamAsync(teamId);

        var tenants = (await teamService.GetTenantsInTeamAsync(teamId)).ToList();
        var memberNames = tenants.ToDictionary(t => t.Id.ToString(), t => t.Name);

        var (signIns, recentActivity) = await GetLogStatsAsync(memberNames);

        return new DashboardDto(
            members,
            roles,
            appCounts.Total,
            appCounts.Inactive,
            licenseStats.Total,
            licenseStats.Active,
            licenseStats.Paused,
            pendingInvites,
            signIns,
            licensesPerDay.Select(day => new LicensesPerDayDto(day.Date, day.Count)),
            recentActivity);
    }

    private async Task<(int SignIns, IEnumerable<DashboardActivityDto> Recent)> GetLogStatsAsync(
        Dictionary<string, string> memberNames)
    {
        if (memberNames.Count == 0) return (0, []);

        try
        {
            using var conn = await loggerService.GetLoggerConnectionAsync();

            const string signInsSql =
                """
                    SELECT count(*)
                    FROM activity_logs
                    WHERE event_type = 'LoginSuccess'
                      AND timestamp > now() - interval '24 hours'
                      AND tenant_id = ANY(@TenantIds);
                """;

            const string recentSql =
                """
                    SELECT tenant_id as TenantId,
                           event_type as EventType,
                           message as Message,
                           timestamp as Timestamp
                    FROM activity_logs
                    WHERE tenant_id = ANY(@TenantIds)
                    ORDER BY timestamp DESC
                    LIMIT @Limit;
                """;

            var tenantIds = memberNames.Keys.ToArray();

            var signIns = await conn.ExecuteScalarAsync<int>(signInsSql, new { TenantIds = tenantIds });

            var rows = await conn.QueryAsync<ActivityLogRow>(recentSql,
                new { TenantIds = tenantIds, Limit = RecentActivityLimit });

            var recent = rows.Select(row =>
            {
                var userName = memberNames.GetValueOrDefault(row.TenantId ?? "", "Unknown user");

                return new DashboardActivityDto(
                    MapDescription(row.EventType, userName) ?? row.Message ?? "System event",
                    MapEventType(row.EventType),
                    row.Timestamp,
                    userName);
            }).ToList();

            return (signIns, recent);
        }
        catch
        {
            // activity log storage unavailable: the dashboard still renders everything else
            return (0, []);
        }
    }

    private static string? MapDescription(string? eventType, string userName)
    {
        return eventType switch
        {
            "LoginSuccess" => $"{userName} signed in",
            "LoginFailed" => $"Failed sign-in attempt for {userName}",
            "Logout" => $"{userName} signed out",
            "AccountCreated" => $"{userName} created their account",
            "TokenIssued" => $"Token issued for {userName}",
            "TokenRefreshed" => $"{userName} refreshed their session",
            "TokenRevoked" => $"Token revoked for {userName}",
            "UserInvited" => $"{userName} invited a new member",
            "InviteAccepted" => $"{userName} accepted a team invite",
            "InviteDeclined" => $"{userName} declined a team invite",
            "InviteRevoked" => $"{userName} cancelled a team invite",
            "MemberRemoved" => $"{userName} removed a team member",
            "RoleCreated" => $"{userName} created a role",
            "RoleUpdated" => $"{userName} updated role permissions",
            "ApplicationCreated" => $"{userName} created an application",
            "ApplicationUpdated" => $"{userName} updated an application",
            "ApplicationDeleted" => $"{userName} deleted an application",
            _ => null
        };
    }

    private static string MapEventType(string? eventType)
    {
        return eventType switch
        {
            "LoginSuccess" or "LoginFailed" or "Logout" or "TokenIssued" or "TokenRefreshed" => "login",
            "AccountCreated" or "UserInvited" or "InviteAccepted" or "RoleCreated" or "ApplicationCreated" => "create",
            "ApplicationUpdated" => "update",
            "TokenRevoked" or "MemberRemoved" or "ApplicationDeleted" or "InviteRevoked" => "delete",
            "RoleUpdated" => "permission",
            _ => "action"
        };
    }

    private sealed record ActivityLogRow(
        string? TenantId,
        string? EventType,
        string? Message,
        DateTime Timestamp);
}
