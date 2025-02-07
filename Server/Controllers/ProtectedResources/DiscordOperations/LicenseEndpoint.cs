using Authentication.Services.Users;
using Microsoft.AspNetCore.Authorization;

namespace Authentication.Endpoints.ProtectedResources.DiscordOperations;

public class LicenseEndpoint
{
    [Authorize(Policy = "Special")]
    internal static async Task<IResult> Handle(HttpContext context, ILicenseManagerService userManager, long discordId)
    {
        var response = new DiscordResponse<List<string>>();

        var userLicenses = await userManager.GetLicenseLicenseListAsync(discordId);

        if (userLicenses == null)
        {
            response.Error = "License Has no Licenses";
            response.Result = [];
            return Results.BadRequest(response);
        }

        //response.Result = userLicenses.Select(x => x.License).ToList();


        return Results.Json(response);
    }
}