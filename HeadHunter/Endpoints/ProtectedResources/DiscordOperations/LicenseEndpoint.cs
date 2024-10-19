using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;

namespace HeadHunter.Endpoints.ProtectedResources.DiscordOperations
{

    public class LicenseEndpoint
    {
        [Authorize(Policy = "Special")]
        internal static async Task<IResult> Handle(HttpContext context, IUserManagerService userManager,long discordId)
        {
            var response = new DiscordResponse<List<string>>();

            var userLicenses = await userManager.GetUserLicenseListAsync(discordId);

            if(userLicenses == null)
            {
                response.Error = "User Has no Licenses";
                response.Result = [];
                return Results.BadRequest(response);
            }

            response.Result = userLicenses.Select(x => x.License).ToList();


            return Results.Json(response);
        }
    }
}
