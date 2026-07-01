using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Roles;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamCreateRoleEndpoint : Endpoint<CreateRoleDto>
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IRoleService _roleService;

    public TeamCreateRoleEndpoint(IRoleService roleService, IActivityLoggerService activityLogger)
    {
        _roleService = roleService;
        _activityLogger = activityLogger;
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

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        _activityLogger.LogEvent(ActivityEventType.RoleCreated, role.RoleName,
            session!.TenantId.ToString(), new { TeamId = teamId, role.RoleId });

        await SendOkAsync(role, ct);
    }
}