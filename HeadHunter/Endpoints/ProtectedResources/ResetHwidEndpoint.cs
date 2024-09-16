using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;

[Authorize(Policy = "Special")]
internal class ResetHwidEndpoint
{
    internal static async Task<IResult> Handle(HttpContext context, IUserManagerService userManager)
    {
        if(!context.Request.Query.TryGetValue("discordId", out var discordId) ||
            !context.Request.Query.TryGetValue("License", out var License))
        {
            return Results.BadRequest(new { Error = "Invalid Discord Id" });
        }

        var userLicense = await userManager.GetUserByLicenseAsync(License.ToString());

        if(userLicense == null)
        {
            return Results.BadRequest();
        }

        if(userLicense.DiscordUser != long.Parse(discordId))
        {
            return Results.BadRequest();
        }

        if(userLicense.Hwid == null)
        {
            return Results.BadRequest();
        }

        await userManager.ResetUserHwidAsync((long) userLicense.DiscordUser);

        // This cant be this way, we need to give a message
        return Results.Ok();
    }
}