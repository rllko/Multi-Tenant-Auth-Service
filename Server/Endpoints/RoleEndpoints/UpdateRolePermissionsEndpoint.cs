using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.RoleEndpoints;

public class UpdateRolePermissionsEndpoint(IRoleService roleService) : Endpoint<UpdateRoleScopesDto>
{
    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/roles/{roleId:int}/permissions");
        PreProcessor<TenantProcessor<UpdateRoleScopesDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.update_roles")));
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

        await SendOkAsync(ct);
    }
}

public record UpdateRoleScopesDto(int[] Scopes);