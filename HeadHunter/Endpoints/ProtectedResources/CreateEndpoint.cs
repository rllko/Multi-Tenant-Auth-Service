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

        internal static async Task<IResult> HandleBulk(HttpContext httpContext, [FromServices] IUserManagerService userManagerService)
        {
            httpContext.Request.Query.TryGetValue("amount", out var amount);

            if(int.TryParse(amount, out var amountInt) == false)
            {
                return Results.BadRequest(new { Error = "Amount is not a valid number" });
            }

            var userList = await userManagerService.CreateUserInBulk(amountInt);

            return Results.Ok(new
            {
                result = userList.Select(x => x.License).ToList()
            });
        }
    }
}
