using HeadHunter.Common;
using HeadHunter.OauthResponse;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.ProtectedResources;

public class ConfirmDiscordEndpoint
{
    //[Authorize(Policy="Special")]
    [HttpPost]
    public static async Task<IResult> Handle(HttpContext httpContext, IUserManagerService userManagerService)
    {
        var Request = httpContext.Request;
        Request.Form.TryGetValue("hwid", out var hwid);
        Request.Form.TryGetValue("license", out var license);
        Request.Form.TryGetValue("discord_id", out var discord);

        if(string.IsNullOrEmpty(hwid) || string.IsNullOrEmpty(license) || string.IsNullOrEmpty(discord))
        {
            await httpContext.Response.WriteAsJsonAsync(new { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
            return Results.NotFound();
        }

        var user = await userManagerService.GetUserByLicenseAsync(license!);

        if(user == null)
        {
            return Results.BadRequest("Key is invalid.");
        }

        if(user.DiscordUserNavigation != null)
        {
            return Results.BadRequest("Key is already redeemed.");
        }

        user = await userManagerService.ConfirmUserRegistrationAsync(license!, long.Parse(discord), hwid!);

        return Results.Json(new { Error = "", Result = user });
    }
}