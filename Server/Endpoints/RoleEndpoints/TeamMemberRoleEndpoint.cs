using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class RoleUpdateAttrEndpoint : Endpoint<UpdateRoleDto>
{
    private readonly ITenantService _tenantService;

    public RoleUpdateAttrEndpoint(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    public override void Configure()
    {
        Patch("/teams/{teamId:guid}/members/{memberId:guid}");
        PreProcessor<TenantProcessor<UpdateRoleDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("team.fetch_team_members")));
    }

    public override async Task HandleAsync(UpdateTenantRoleDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var memberId = Route<Guid>("memberId");

        var tenants = await _tenantService.UpdateTenantRoleAsync(req, memberId);
        await SendOkAsync(tenants, ct);
    }
}