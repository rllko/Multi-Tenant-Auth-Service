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
        Options(x => x.WithMetadata(new RequiresPermissionAttribute("application.retrieve")));
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