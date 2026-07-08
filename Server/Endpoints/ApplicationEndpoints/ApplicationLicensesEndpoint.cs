using Authentication.Attributes;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Applications;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationLicensesEndpoint : EndpointWithoutRequest<IEnumerable<LicenseDto>>
{
    private readonly IApplicationService _applicationService;
    private readonly ILicenseService _licenseService;

    public ApplicationLicensesEndpoint(ILicenseService licenseService, IApplicationService applicationService)
    {
        _licenseService = licenseService;
        _applicationService = applicationService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/licenses");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.retrieve_info")));

        Summary(s =>
        {
            s.Summary = "List licenses of an application";
            s.Description = "Returns all licenses issued for the application, including activation, pause, ban/revoke state, and expiry (unix seconds). Bearer auth; requires the license.retrieve_info scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Response<IEnumerable<LicenseDto>>(200, "Array of licenses: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Application not found or validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
        });
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");

        if (await _applicationService.ApplicationBelongsToTeamAsync(teamId, appId) is false)
        {
            await SendForbiddenAsync(ct);
            return;
        }

        var apps = await _licenseService.GetLicenseByApplication(appId);

        await apps.Match(
            async licenses => await SendOkAsync(licenses, ct),
            async () =>
            {
                AddError("Something went wrong.");
                await SendErrorsAsync(cancellation: ct);
            }
        );
    }
}