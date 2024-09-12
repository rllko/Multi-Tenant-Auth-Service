using HeadHunter.Common;
using HeadHunter.Services;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Endpoints
{
    public static class ClientLoginEndpoint
    {

        [HttpGet("{key:guid}")]
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService, [FromServices] DevKeys _devKeys)
        {
            if(!httpContext.Request.Query.TryGetValue("3917505287", out var License))
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(License))
            {
                return Results.NotFound();
            }

            var userKey = await userManagerService.GetUserByLicenseAsync(License);

            if(userKey == null)
            {
                return Results.BadRequest("License is invalid.");
            }

            // Create Handler for JWT
            var handler = new JwtSecurityTokenHandler();

            // Create token to send to the user
            var token = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey,_devKeys);

            // check if the user has confirmed their discord account
            if(userKey.DiscordUser == null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                await httpContext.Response.WriteAsJsonAsync("License is not confirmed.");
                return Results.Conflict();
            }

            // create the token string
            var encrypted = handler.CreateEncodedJwt(token);

            return Results.Json(new { Error = "None", Result = encrypted });
        }

    }
}
