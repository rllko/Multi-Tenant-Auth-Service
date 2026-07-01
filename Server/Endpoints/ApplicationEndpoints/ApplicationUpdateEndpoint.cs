using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationUpdateEndpoint : Endpoint<UpdateApplicationDto, ApplicationDto>
{
    private readonly IApplicationService _applicationService;

    public ApplicationUpdateEndpoint(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    public override void Configure()
    {
        Put("/teams/{teamId:guid}/apps/{appId:guid}");
        PreProcessor<TenantProcessor<UpdateApplicationDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.update")));
    }

    public override async Task HandleAsync(UpdateApplicationDto req, CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var existing = await _applicationService.GetApplicationByIdAsync(appId);

        await existing.Match(
            async _ =>
            {
                var updated = await _applicationService.UpdateApplicationAsync(appId, req, null);
                await SendOkAsync(updated, ct);
            },
            async () => await SendNotFoundAsync(ct));
    }
}
