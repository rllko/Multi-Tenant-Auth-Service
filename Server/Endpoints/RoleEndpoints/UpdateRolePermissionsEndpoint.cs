using Authentication.Attributes;
using Authentication.Models;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.RoleEndpoints;

public class UpdateRolePermissionsEndpoint(IRoleService roleService, IActivityLoggerService activityLogger)
    : Endpoint<UpdateRoleScopesDto>
{
    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/roles/{roleId:int}/permissions");
        PreProcessor<TenantProcessor<UpdateRoleScopesDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.update_roles")));
    
        Summary(s =>
        {
            s.Summary = "Replace a role's permission scopes";
            s.Description = "Body: { scopes: int[] } — the full desired scope id set. The server diffs against current scopes and assigns/removes accordingly. Bearer auth; requires the team.update_roles scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["roleId"] = "Role id (integer)";
            s.Response(200, "Scopes replaced");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(UpdateRoleScopesDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var roleId = Route<int>("roleId");

        var currentScopes = await roleService.GetScopesInRoleAsync(roleId);
        var newScopes = req.Scopes;

        var enumerable = currentScopes as int[] ?? currentScopes.ToArray();
        var differencesBetweenNewAndOld = enumerable.Except(newScopes).Concat(newScopes.Except(enumerable));

        foreach (var scope in differencesBetweenNewAndOld)
            if (currentScopes.Contains(scope))
                await roleService.RemoveScopeFromRoleAsync(roleId, scope);
            else
                await roleService.AssignScopeToRoleAsync(roleId, scope);

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.RoleUpdated, roleId.ToString(),
            session!.TenantId.ToString(), new { TeamId = teamId, req.Scopes });

        await SendOkAsync(ct);
    }
}

public record UpdateRoleScopesDto(int[] Scopes);