using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.ProtectedResources
{
    internal static class CreateEndpoint
    {
        [Authorize(Policy = "Special")]
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService)
        {
            httpContext.Request.Query.TryGetValue("discordId", out var discordIdString);
            var isNotNull = long.TryParse(discordIdString, out var discordIdLong);

            var key = await userManagerService.CreateUserAsync(isNotNull  ? discordIdLong :  null);

            if(key == null)
            {
                return Results.BadRequest("Something went wrong :(");
            }

            return Results.Ok(key);
        }

        internal static async Task HandleBulk(HttpContext context)
        {
            throw new NotImplementedException();
        }
    }
}
