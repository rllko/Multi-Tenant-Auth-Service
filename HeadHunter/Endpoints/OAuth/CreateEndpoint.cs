using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    public static class CreateEndpoint
    {
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService)
        {
            //var page = httpContext.Request.Headers.FirstOrDefault(u => u.Key == "Authorization");

            //if(string.IsNullOrEmpty(page.Value))
            //{
            //    return Results.BadRequest("Authorization is null or empty.");
            //}

            // add validate here

            // use CheckClientResult
            var key = await userManagerService.CreateUserAsync();

            if(key == null)
            {
                return Results.BadRequest("Something went wrong :(");
            }

            return Results.Ok(key);
        }
    }
}
