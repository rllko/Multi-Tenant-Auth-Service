using HeadHunter.Common;
using HeadHunter.OauthResponse;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.ProtectedResources;
[Authorize(Policy = "Special")]
public class ConfirmDiscordEndpoint
{

    [HttpPost]
    public static async Task<IResult> Handle(HttpContext httpContext,
        IUserManagerService userManagerService,
        ICodeStorageService codeStorage)
    {
        var Request = httpContext.Request;
        Request.Form.TryGetValue("code", out var Code);
        Request.Form.TryGetValue("discord_id", out var DiscordId);

        if(string.IsNullOrEmpty(Code) || string.IsNullOrEmpty(DiscordId))
        {
            await httpContext.Response.WriteAsJsonAsync(new { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
            return Results.BadRequest("Something went wrong!");
        }

        var userFromCode = codeStorage.GetUserByCode(Code.ToString());

        if(userFromCode == null)
        {
            return Results.BadRequest("Key is invalid.");
        }

        if(long.TryParse(DiscordId.ToString(), out long DiscordUser) is false)
        {
            return Results.BadRequest("Discord ID is invalid.");
        }

        if(userFromCode.User.Hwid == null)
        {
            return Results.BadRequest("Hwid cannot be null.");
        }

        userFromCode.User.DiscordUser = DiscordUser;
        var updatedUser = await userManagerService.ConfirmUserRegistrationAsync(userFromCode);

        return Results.Json(new { Error = "", Result = updatedUser });
    }
}