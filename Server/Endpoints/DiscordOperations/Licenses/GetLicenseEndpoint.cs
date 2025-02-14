using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

public class GetLicenseEndpoint(ILicenseService licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
#warning add authentication bruh
        Get("/protected/licenses/{discordId}");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Route<ulong>("discordId");
        var response = new DiscordResponse<List<string>>();

        var userLicenses = await licenseService.GetLicensesByDiscordId(discordId);
        var enumerable = userLicenses as License[] ?? userLicenses.ToArray();

        await SendOkAsync(new DiscordResponse<IEnumerable<LicenseDto>>
        {
            Result = enumerable.Select(x => x.MapToDto())
        }, ct);
    }
}