using Authentication.Attributes;
using Authentication.RequestProcessors;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamMemberRoleEndpoint : Endpoint<UpdateTenantRoleDto>
{
    private readonly ITenantService _tenantService;

    public TeamMemberRoleEndpoint(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/members/{memberId:guid}");
        PreProcessor<TenantProcessor<UpdateTenantRoleDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.team.update_roles")));
    
        Summary(s =>
        {
            s.Summary = "Change a member's role";
            s.Description = "Assigns a different role to the member. Body: { roleId: int }. Bearer auth; requires the team.update_roles scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["memberId"] = "Tenant id of the member (GUID)";
            s.Response(200, "Role updated");
            s.Response(403, "Not a team member or missing scope");
        });
    }

    public override async Task HandleAsync(UpdateTenantRoleDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("memberId");

        var tenants = await _tenantService.UpdateTenantRoleAsync(req, memberId, teamId);
        await SendOkAsync(tenants, ct);
    }
}

public record UpdateTenantRoleDto(int roleId);