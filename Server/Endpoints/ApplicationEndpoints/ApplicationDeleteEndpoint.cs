using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationDeleteEndpoint : EndpointWithoutRequest
{
    private readonly IApplicationService _applicationService;

    public ApplicationDeleteEndpoint(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    public override void Configure()
    {
        Delete("/teams/{teamId:guid}/apps/{appId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.delete")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var deleted = await _applicationService.DeleteApplicationAsync(appId, null);

        if (deleted)
            await SendOkAsync(ct);
        else
            await SendNotFoundAsync(ct);
    }
}
