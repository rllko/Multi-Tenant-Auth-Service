using Authentication.Models.Entities;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints;

public class RandomPWTest(ILicenseService licenseService) : EndpointWithoutRequest<License>
{
    public override void Configure()
    {
        Get("test");
        AllowAnonymous();
    }

    public override Task<License> ExecuteAsync(CancellationToken ct)
    {
        var discord = licenseService.GetLicenseByUsernameWithDiscordAsync(Route<string>("username"));
        return discord;
    }
}