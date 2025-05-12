using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationLicensesEndpoint : EndpointWithoutRequest<IEnumerable<LicenseDto>>
{
    private readonly ILicenseService _licenseService;

    public ApplicationLicensesEndpoint(ILicenseService licenseService)
    {
        _licenseService = licenseService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/licenses");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.retrieve_info")));
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

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