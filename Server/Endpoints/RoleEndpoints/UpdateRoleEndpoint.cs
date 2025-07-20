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