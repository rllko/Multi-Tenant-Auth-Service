using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Logger;
using Authentication.Services.Teams;
using Dapper;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public record ActivityUserDto(string Name);

public record ActivityDto(
    string Description,
    string Type,
    DateTime Timestamp,
    ActivityUserDto User);

public class TeamActivityEndpoint(ITeamService teamService, ILoggerService loggerService)
    : EndpointWithoutRequest<IEnumerable<ActivityDto>>
{
    public override void Configure()
    {
        Get("/teams/{teamId:guid}/activity");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("log.retrieve_all")));
    
        Summary(s =>
        {
            s.Summary = "Team activity feed";
            s.Description = "Returns recent events for the team's members (sign-ins, invites, role and application changes) with friendly descriptions, a type for badge coloring, timestamp, and user. Bearer auth; requires the log.retrieve_all scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Response<IEnumerable<ActivityDto>>(200, "Array of events: { description, type (login|create|update|delete|permission|action), timestamp, user: { name } }");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        var members = (await teamService.GetTenantsInTeamAsync(teamId)).ToList();

        if (members.Count == 0)
        {
            await SendOkAsync([], ct);

            return;
        }

        var memberNames = members.ToDictionary(m => m.Id.ToString(), m => m.Name);

        const string sql =
            """
                SELECT tenant_id as TenantId,
                       event_type as EventType,
                       message as Message,
                       timestamp as Timestamp
                FROM activity_logs
                WHERE tenant_id = ANY(@TenantIds)
                ORDER BY timestamp DESC
                LIMIT 200;
            """;

        using var conn = await loggerService.GetLoggerConnectionAsync(ct);

        var rows = await conn.QueryAsync<ActivityLogRow>(sql,
            new { TenantIds = memberNames.Keys.ToArray() });

        var activities = rows.Select(row =>
        {
            var userName = memberNames.GetValueOrDefault(row.TenantId ?? "", "Unknown user");

            return new ActivityDto(
                MapDescription(row.EventType, userName) ?? row.Message ?? "System event",
                MapEventType(row.EventType),
                row.Timestamp,
                new ActivityUserDto(userName));
        });

        await SendOkAsync(activities, ct);
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
