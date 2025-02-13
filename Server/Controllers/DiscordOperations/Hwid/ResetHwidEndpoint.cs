using Authentication.Endpoints;
using Authentication.Services.ActivityLogger;
using Authentication.Services.Users;
using Microsoft.AspNetCore.Authorization;

[Authorize(Policy = "Special")]
internal class ResetHwidEndpoint
{
    internal static async Task<IResult> Handle(
        HttpContext context,
        ILicenseManagerService userManager,
        IActivityLogger logger, long discordId, string license)
    {
        var response = new DiscordResponse<string>();

        if (string.IsNullOrEmpty(license))
        {
            response.Error = "License is required";
            return Results.Json(response);
        }

        var userLicense = await userManager.GetLicenseByLicenseAsync(license);

        if (userLicense == null)
        {
            response.Error = "Something went wrong.";
            return Results.Json(response);
        }

        if (userLicense.DiscordUser != null && userLicense.DiscordUser.DiscordId != discordId)
        {
            response.Error = "This license doesnt belong to your Discord Account";
            return Results.Json(response);
        }

        if (userLicense.Hw == null)
        {
            response.Error = "This license doesnt need a reset!";
            return Results.Json(response);
        }

        var hwidResetCount = await userManager.GetLicenseHwidResetCount("todo");
        const int maxHwidResets = 3;

        if (hwidResetCount >= maxHwidResets)
        {
            response.Error = $"You have achieved the limit of this month ({maxHwidResets}/{maxHwidResets})";
            return Results.Json(response);
        }

        await logger.LogActivityAsync(ActivityType.KeyReset, "", userLicense.Id);
        await userManager.ResetLicenseHwidAsync("todo");

        // response.Result =
        //   $"Successfully reset license ``{userLicense.License}`` ({hwidResetCount + 1} / {maxHwidResets})";
        return Results.Json(response);
    }
}