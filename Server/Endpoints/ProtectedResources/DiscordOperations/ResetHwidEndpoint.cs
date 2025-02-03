using HeadHunter.Endpoints;
using HeadHunter.Services.ActivityLogger;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

[Authorize(Policy = "Special")]
internal class ResetHwidEndpoint
{
    internal static async Task<IResult> Handle(
        HttpContext context,
        IUserManagerService userManager,
        IActivityLogger logger, long discordId,string license)
    {

        var response = new DiscordResponse<string>();

        if (string.IsNullOrEmpty(license))
        {
            response.Error = "License is required";
            return Results.Json(response);
        }
        
        var userLicense = await userManager.GetUserByLicenseAsync(license.ToString());

        if(userLicense == null)
        {
            response.Error = "Something went wrong.";
            return Results.Json(response);
        }

        if(userLicense.DiscordUser != discordId)
        {
            response.Error = "This license doesnt belong to your Discord Account";
            return Results.Json(response);
        }

        if(userLicense.Hwid == null)
        {
            response.Error = "This license doesnt need a reset!";
            return Results.Json(response);
        }

        var hwidResetCount = await userManager.GetUserHwidResetCount(userLicense.License);
        const int maxHwidResets = 3;
        
        if (hwidResetCount >= maxHwidResets)
        {
            response.Error = $"You have achieved the limit of this month ({maxHwidResets}/{maxHwidResets})";
            return Results.Json(response);
        }

        await logger.LogActivityAsync(ActivityType.KeyReset, "",userLicense.Id);
        await userManager.ResetUserHwidAsync( userLicense.License);
        
        response.Result = $"Successfully reset license ``{userLicense.License}`` ({hwidResetCount+1} / {maxHwidResets})";
        return Results.Json(response);
    }
}