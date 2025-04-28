using Authentication.AuthenticationHandlers;
using Authentication.Models.Entities;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperationEndpoints.Licenses;

public class GetLicenseEndpoint(ILicenseService licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Get("/protected/licenses/{discordId}");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Route<long>("discordId");
        var response = new DiscordResponse<List<string>>();

        var userLicenses = await licenseService.GetLicensesByDiscordId(discordId);
        var enumerable = userLicenses as License[] ?? userLicenses.ToArray();

        await SendOkAsync(enumerable.Select(x => x.MapToDto()).ToList(), ct);
    }
}