using Authentication.Services.CodeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.ProtectedResources.DiscordOperations;

[Authorize(Policy = "Special")]
public class ConfirmDiscordEndpoint
{
    [HttpPost]
    public static async Task<IResult> Handle(HttpContext httpContext,
        ILicenseManagerService userManagerService,
        ICodeStorageService codeStorage)
    {
        var response = new DiscordResponse<string>();

        var Request = httpContext.Request;
        Request.Form.TryGetValue("code", out var code);
        Request.Form.TryGetValue("discord_id", out var discordId);

        if (string.IsNullOrEmpty(code))
        {
            response.Error = "Invalid Params!";
            return Results.Json(response);
        }

        var userFromCode = codeStorage.GetUserByCode(code.ToString());

        if (userFromCode == null)
        {
            response.Error = "Key is invalid.";
            return Results.Json(response);
        }

        long.TryParse(discordId, out var discord);

        //userFromCode.License.DiscordUser = discord;
        // var updatedUser = await userManagerService.ConfirmUserRegistrationAsync(userFromCode);

        response.Result = "Sucess!";
        return Results.Json(response);
    }
}