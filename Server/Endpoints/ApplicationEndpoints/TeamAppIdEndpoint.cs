using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class TeamAppIdEndpoint : EndpointWithoutRequest<IEnumerable<ApplicationDto>>
{
    private readonly IApplicationService _applicationService;

    public TeamAppIdEndpoint(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.retrieve")));
    
        Summary(s =>
        {
            s.Summary = "Get an application";
            s.Description = "Returns a single application by id. Bearer auth; requires the application.retrieve scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Response<IEnumerable<ApplicationDto>>(200, "The application: { id, name, description, status }");
            s.Response<ErrorResponse>(400, "Application not found");
            s.Response(403, "Not a team member or missing scope");
        });
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var apps = await _applicationService.GetApplicationByIdAsync(appId);

        await apps.Match(
            async roles => await SendOkAsync(apps, ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            }
        );
    }
}