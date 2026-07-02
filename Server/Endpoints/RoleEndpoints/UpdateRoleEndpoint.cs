using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.RoleEndpoints;

public class UpdateRoleEndpoint(IRoleService roleService) : Endpoint<UpdateRoleDto>
{
    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/roles/{roleId:int}");
        PreProcessor<TenantProcessor<UpdateRoleDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.update_roles")));
    
        Summary(s =>
        {
            s.Summary = "Update a role";
            s.Description = "Updates a team role's attributes. Currently a stub that returns 200 without persisting. Bearer auth; requires the team.update_roles scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["roleId"] = "Role id (integer)";
            s.Response(200, "OK (stub, nothing persisted yet)");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(UpdateRoleDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var roleId = Route<int>("roleId");

        //  await roleService.UpdateRoleAsync(roleId, req);
        await SendOkAsync(ct);
    }
}

public record UpdateRoleDto(int[] Scopes);