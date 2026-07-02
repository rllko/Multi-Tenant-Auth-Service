using Authentication.Attributes;
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
        Get("/teams/{teamId:guid}/apps");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.retrieve")));
    
        Summary(s =>
        {
            s.Summary = "List team applications";
            s.Description = "Returns the applications owned by the team (id, name, description, status). Bearer auth; requires the application.retrieve scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Response<IEnumerable<ApplicationDto>>(200, "Array of applications: { id, name, description, status }");
            s.Response(403, "Not a team member or missing scope");
        });
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

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