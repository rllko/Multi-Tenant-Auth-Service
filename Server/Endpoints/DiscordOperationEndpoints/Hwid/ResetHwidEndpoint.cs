using Authentication.AuthenticationHandlers;
using Authentication.Services;
using Authentication.Services.Licenses;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperationEndpoints.Hwid;

public class ResetHwidEndpoint(ILicenseService licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Delete("/protected/{discordId}/licenses/{license}");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Route<long>("discordID");
        var license = Route<string>("license");

        var response = new DiscordResponse<string>();

        var licenseGuid = Guider.ToGuidFromString(license!);
        var userLicense = await licenseService.GetLicenseByValueAsync(licenseGuid);

        if (userLicense == null)
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        if (userLicense.DiscordId != discordId) await SendUnauthorizedAsync(ct);

        // if (userLicense.Hw == null)
        // {
        //     response.Error = "This license doesnt need a reset!";
        //     await SendOkAsync(response, ct);
        // }

        // var hwidResetCount = await userManager.GetLicenseHwidResetCount("todo");
        // const int maxHwidResets = 3;
        //
        // if (hwidResetCount >= maxHwidResets)
        // {
        //     response.Error = $"You have achieved the limit of this month ({maxHwidResets}/{maxHwidResets})";
        //     await SendOkAsync(response, ct);
        // }

        // await logger.LogActivityAsync(ActivityType.KeyReset, "", userLicense.Id);
        // await userManager.ResetLicenseHwidAsync("todo"); ({hwidResetCount + 1} / {maxHwidResets})

        response.Result =
            $"Successfully reset license ``{license}`` ";
        await SendOkAsync(response, ct);
    }
}