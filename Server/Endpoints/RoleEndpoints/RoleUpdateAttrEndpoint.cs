using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class RoleUpdateAttrEndpoint : Endpoint<UpdateRoleDto>
{
    private readonly IRoleService _roleService;

    public RoleUpdateAttrEndpoint(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/roles/{roleId:guid}");
        PreProcessor<TenantProcessor<UpdateRoleDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.update_roles")));
    }

    public override async Task HandleAsync(UpdateRoleDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var roleId = Route<Guid>("roleId");

        var tenants = await _roleService.UpdateRoleAsync(roleId, req);
        await SendOkAsync(tenants, ct);
    }
}