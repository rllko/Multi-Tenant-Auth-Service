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

        var userLicense = await userManager.GetUserByLicenseAsync(license.ToString());

        if(userLicense == null)
        {
            return Results.BadRequest();
        }
        #warning Fix this on the bot
        if(userLicense.DiscordUser != discordId)
        {
            response.Error = "This license doesnt belong to your Discord Account";
            return Results.Json(response);
        }

        if(userLicense.Hwid == null)
        {
            response.Error = "You Achieved the limit of this month (3/3)";
            return Results.Json(response);
        }

        var hwidResetCount = await userManager.GetUserHwidResetCount(userLicense.License);
        const int maxHwidResets = 3;
        
        if (hwidResetCount >= maxHwidResets)
        {
            response.Error = $"You Achieved the limit of this month ({maxHwidResets}/{maxHwidResets})";
            return Results.Json(response);
        }

        await logger.LogActivityAsync(ActivityType.KeyReset, "",userLicense.Id);
        await userManager.ResetUserHwidAsync((long) userLicense.DiscordUser);
        
        response.Result = $"Successfully reset license ``{userLicense.License}`` ({hwidResetCount} / {maxHwidResets}";
        return Results.Json(response);
    }
}