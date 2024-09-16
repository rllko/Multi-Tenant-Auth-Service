
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;

namespace HeadHunter.Endpoints
{

    public class LicenseEndpoint
    {
        [Authorize(Policy = "Special")]
        internal static async Task<IResult> Handle(HttpContext context, IUserManagerService userManager)
        {
            if(!context.Request.Query.TryGetValue("discordId", out var License))
            {
                return Results.BadRequest(new { Error = "Invalid Discord Id" });
            }

            var userLicenses = await userManager.GetUserLicenseListAsync(long.Parse(License));

            if(userLicenses == null)
            {
                return Results.BadRequest();
            }

            return Results.Json(new { Error = "None", Result = userLicenses.Select(x => x.License).ToList() });
        }
    }
}
