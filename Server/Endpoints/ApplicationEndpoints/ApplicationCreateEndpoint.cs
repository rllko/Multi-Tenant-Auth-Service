using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationCreateEndpoint : Endpoint<CreateApplicationDto, ApplicationDto>
{
    private readonly IApplicationService _applicationService;

    public ApplicationCreateEndpoint(IApplicationService applicationService)
    {
        _applicationService = applicationService;
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
            async app => await SendOkAsync(app, ct),
            async failed =>
            {
                foreach (var error in failed.Errors)
                    AddError(error.ErrorMessage);

                await SendErrorsAsync(cancellation: ct);
            });
    }
}
