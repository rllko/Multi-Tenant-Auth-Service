using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using FastEndpoints;

namespace Authentication.Endpoints.TeamsEndpoints;

public class TeamAppsEndpoint : EndpointWithoutRequest<IEnumerable<ApplicationDto>>
{
    private readonly IApplicationService _applicationService;

    public TeamAppsEndpoint(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    public override void Configure()
    {
#warning add permission here
        Get("/teams/{teamId:guid}/apps");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var apps = await _applicationService.GetApplicationsByTeamIdAsync(teamId);

        apps.Match(
            async roles => await SendOkAsync(roles, ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            }
        );
    }
}