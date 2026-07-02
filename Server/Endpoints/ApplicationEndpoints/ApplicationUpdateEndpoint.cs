using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationUpdateEndpoint : Endpoint<UpdateApplicationDto, ApplicationDto>
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IApplicationService _applicationService;

    public ApplicationUpdateEndpoint(IApplicationService applicationService, IActivityLoggerService activityLogger)
    {
        _applicationService = applicationService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Put("/teams/{teamId:guid}/apps/{appId:guid}");
        PreProcessor<TenantProcessor<UpdateApplicationDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.update")));
    
        Summary(s =>
        {
            s.Summary = "Update an application";
            s.Description = "Partially updates name, description, or status ('active'/'inactive'); omitted fields keep their value. Returns the updated application, 404 when missing. Bearer auth; requires the application.update scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
        });
    }

    public override async Task HandleAsync(UpdateApplicationDto req, CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var existing = await _applicationService.GetApplicationByIdAsync(appId);

        await existing.Match(
            async _ =>
            {
                var updated = await _applicationService.UpdateApplicationAsync(appId, req, null);

                var session = HttpContext.Items["Session"] as TenantSessionInfo;
                _activityLogger.LogEvent(ActivityEventType.ApplicationUpdated, updated.Name,
                    session!.TenantId.ToString(), new { AppId = appId, req.Status });

                await SendOkAsync(updated, ct);
            },
            async () => await SendNotFoundAsync(ct));
    }
}
