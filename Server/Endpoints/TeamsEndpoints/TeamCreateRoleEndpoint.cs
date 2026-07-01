using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamCreateRoleEndpoint : Endpoint<CreateRoleDto>
{
    private readonly IRoleService _roleService;

    public TeamCreateRoleEndpoint(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("/teams/{teamId:guid}/roles");
        PreProcessor<TenantProcessor<CreateRoleDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.create_roles")));
    }

    public override async Task HandleAsync(CreateRoleDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        req.CreatedBy = teamId;

        var role = await _roleService.CreateRoleAsync(req);

        await SendOkAsync(role, ct);
    }
}