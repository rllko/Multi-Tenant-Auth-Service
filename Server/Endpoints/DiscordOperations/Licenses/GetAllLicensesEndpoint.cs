using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

public class GetAllLicensesEndpoint(ILicenseService licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Get("/protected/licenses");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userLicenses = await licenseService.GetAllLicensesAsync();

        var enumerable = userLicenses as License[] ?? userLicenses.ToArray();

        await SendOkAsync(new DiscordResponse<IEnumerable<LicenseDto>>
        {
            Result = enumerable.Select(x => x.MapToDto())
        }, ct);
    }
}