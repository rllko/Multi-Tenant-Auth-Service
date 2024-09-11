using HeadHunter.Models.Entities;
using HeadHunter.Services;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Endpoints
{
    public static class ClientLoginEndpoint
    {

        [HttpGet("{key:guid}")]
        public async static Task<IResult> Handle(HttpContext httpContext, [FromServices] IUserManagerService userManagerService, [FromServices] DevKeys _devKeys)
        {
            if(!httpContext.Request.Query.TryGetValue("key", out var Key))
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(Key))
            {
                return Results.BadRequest("Key is null or empty.");
            }

            var userKey = await userManagerService.GetUserByLicenseAsync(Key);

            if(userKey == null)
            {
                return Results.BadRequest("Key is invalid.");
            }


            var handler = new JwtSecurityTokenHandler();


            var token = new SecurityTokenDescriptor
            {
                Audience = IdentityData.Audience,
                Issuer = IdentityData.Issuer,
                Expires = DateTime.Now.AddDays(30),
                NotBefore = DateTime.Now,
                Claims = new Dictionary<string,object>()
                {
                    [JwtRegisteredClaimNames.Jti] = userKey.License,
                    [JwtRegisteredClaimNames.Sub] = userKey.Id,
                    ["Hwid"]                      = userKey.Hwid,
                    [JwtRegisteredClaimNames.Iat] = DateTime.Now,
                },
                EncryptingCredentials = new EncryptingCredentials(new RsaSecurityKey(_devKeys.RsaEncryptKey),
                SecurityAlgorithms.RsaOAEP, SecurityAlgorithms.RsaPKCS1)
            };

            if(userKey.DiscordUser == null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                await httpContext.Response.WriteAsJsonAsync("Key is not confirmed.");
                return Results.BadRequest();
            }

            return Results.Json(new { Error = "None", Result = handler.CreateEncodedJwt(token) });
        }
    }
}
