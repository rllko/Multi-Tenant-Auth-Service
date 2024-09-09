using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints
{
    public static class ClientLoginEndpoint
    {
        [Authorize]
        [HttpGet("{key:guid}")]
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService)
        {
            var page = httpContext.Request.Query.TryGetValue("key", out var Key);

            if(string.IsNullOrEmpty(Key))
            {
                return Results.BadRequest("Key is null or empty.");
            }

            var key = await userManagerService.GetUserByLicenseAsync(Key);

            if(key == null)
            {
                return Results.BadRequest("Key is invalid.");
            }

            return Results.Ok(key);
        }
    }
}
