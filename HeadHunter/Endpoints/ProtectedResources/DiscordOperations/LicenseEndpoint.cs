using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;

namespace HeadHunter.Endpoints.ProtectedResources.DiscordOperations
{

    public class LicenseEndpoint
    {
        [Authorize(Policy = "Special")]
        internal static async Task<IResult> Handle(HttpContext context, IUserManagerService userManager)
        {
            var response = new DiscordResponse<List<string>>();

            if(!context.Request.Query.TryGetValue("discordId", out var License))
            {
                response.Error = "Invalid Discord Id";
                response.Result = [];
                return Results.BadRequest(response);
            }

            var userLicenses = await userManager.GetUserLicenseListAsync(long.Parse(License!));

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
