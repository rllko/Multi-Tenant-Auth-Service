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
        public async static Task<IResult> HandleGet(HttpContext httpContext, IUserManagerService userManagerService, [FromServices] DevKeys _devKeys)
        {
            // !httpContext.Request.Query.TryGetValue("3391056346", out var Hwid))
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

            // check if the user has confirmed their discord account
            if(userKey.DiscordUser == null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                await httpContext.Response.WriteAsJsonAsync("License is not confirmed.");
                return Results.Conflict();
            }

            // Create Handler for JWT
            var handler = new JwtSecurityTokenHandler();

            // Create token to send to the user
            var token = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey,_devKeys);

            // create the token string
            var encrypted = handler.CreateEncodedJwt(token);

            return Results.Json(new { Error = "None", Result = encrypted });
        }

        [HttpPost]
        public async static Task<IResult> HandlePost(HttpContext httpContext, IUserManagerService userManagerService)
        {
            if(httpContext.Request.Form.TryGetValue("3391056346", out var Hwid) == false ||
               httpContext.Request.Form.TryGetValue("1317706102", out var License) == false)
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(License))
            {
                return Results.NotFound();
            }

            if(userManagerService.GetUserByLicenseAsync(License!) != null)
            {
                return Results.NotFound();
            }

            await userManagerService.ClaimUserLicenseAsync(License.ToString(), Hwid.ToString());
            return Results.Json(new { Message = "Success!" });
        }
    }
}
