using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationDeleteEndpoint : EndpointWithoutRequest
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IApplicationService _applicationService;

    public ApplicationDeleteEndpoint(IApplicationService applicationService, IActivityLoggerService activityLogger)
    {
        _applicationService = applicationService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Delete("/teams/{teamId:guid}/apps/{appId:guid}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.delete")));
    
        Summary(s =>
        {
            s.Summary = "Delete an application";
            s.Description = "Deletes the application and cascades its licenses, sessions, hwids, and OAuth clients. 404 when the application does not exist. Bearer auth; requires the application.delete scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var deleted = await _applicationService.DeleteApplicationAsync(appId, null);

        if (deleted)
        {
            var session = HttpContext.Items["Session"] as TenantSessionInfo;
            _activityLogger.LogEvent(ActivityEventType.ApplicationDeleted, appId.ToString(),
                session!.TenantId.ToString(), new { AppId = appId });

            await SendOkAsync(ct);
        }
        else
        {
            await SendNotFoundAsync(ct);
        }
    }
}
