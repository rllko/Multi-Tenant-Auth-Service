using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.RoleEndpoints;

public class UpdateRolePermissionsEndpoint : Endpoint<UpdateRoleScopesDto>
{
    private readonly IRoleService _roleService;

    public UpdateRolePermissionsEndpoint(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/roles/{roleId:int}");
        PreProcessor<TenantProcessor<UpdateRoleScopesDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.update_roles")));
    }

    public override async Task HandleAsync(UpdateRoleScopesDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var roleId = Route<int>("roleId");

        // var tenants = await _roleService.UpdateRoleAsync(roleId, req);
        await SendOkAsync(ct);
    }
}

public record UpdateRoleScopesDto(int[] Scopes);