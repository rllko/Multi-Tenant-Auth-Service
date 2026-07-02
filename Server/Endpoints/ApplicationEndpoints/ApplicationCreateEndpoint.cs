using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationCreateEndpoint : Endpoint<CreateApplicationDto, ApplicationDto>
{
    private readonly IActivityLoggerService _activityLogger;
    private readonly IApplicationService _applicationService;

    public ApplicationCreateEndpoint(IApplicationService applicationService, IActivityLoggerService activityLogger)
    {
        _applicationService = applicationService;
        _activityLogger = activityLogger;
    }

    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps");
        PreProcessor<TenantProcessor<CreateApplicationDto>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.create")));
    }

    public override async Task HandleAsync(CreateApplicationDto req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");

        if (string.IsNullOrWhiteSpace(req.Name))
        {
            AddError("name is required");
            await SendErrorsAsync(cancellation: ct);

            return;
        }

        var result = await _applicationService.RegisterApplicationAsync(teamId, [], req, null);

        await result.Match(
            async app =>
            {
                var session = HttpContext.Items["Session"] as TenantSessionInfo;
                _activityLogger.LogEvent(ActivityEventType.ApplicationCreated, app.Name,
                    session!.TenantId.ToString(), new { TeamId = teamId, AppId = app.Id });

                await SendOkAsync(app, ct);
            },
            async failed =>
            {
                foreach (var error in failed.Errors)
                    AddError(error.ErrorMessage);

                await SendErrorsAsync(cancellation: ct);
            });
    }
}
