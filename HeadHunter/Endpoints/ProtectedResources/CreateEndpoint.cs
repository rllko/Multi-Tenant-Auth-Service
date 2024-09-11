using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.ProtectedResources
{
    public static class CreateEndpoint
    {
        [Authorize(Policy = "Special")]
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService)
        {
            var key = await userManagerService.CreateUserAsync();

            if(key == null)
            {
                return Results.BadRequest("Something went wrong :(");
            }

            return Results.Ok(key);
        }
    }
}
