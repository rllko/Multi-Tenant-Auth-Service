using HeadHunter.Common;
using HeadHunter.OauthResponse;
using HeadHunter.Services;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HeadHunter.Endpoints
{
    public class ClientRedeemEndpoint
    {
        [HttpPost]
        public async static Task<IResult> Handle(HttpContext httpContext,
            [FromServices] IUserManagerService userManagerService,
            DevKeys devKeys)
        {
            var Request = httpContext.Request;

            Request.Form.TryGetValue("3391056346", out var hwid);
            Request.Form.TryGetValue("3917505287", out var key);

            if(string.IsNullOrEmpty(hwid) || string.IsNullOrEmpty(key) || key.Count < 36)
            {
                await httpContext.Response.WriteAsJsonAsync(new { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
                return Results.NotFound();
            }

            var user = await userManagerService.GetUserByLicenseAsync(key);

            if(user == null)
            {
                await httpContext.Response.WriteAsJsonAsync(new { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
                return Results.BadRequest();
            }

            if(user.DiscordUserNavigation != null)
            {
                return Results.Json(new { Error = "Key is already confirmed." });
            }

            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();


            var token = handler.CreateJwtSecurityToken(
                issuer: "HeadHunter",
                audience: "HeadHunter",
                subject: new ClaimsIdentity(new List<Claim>
                {
                    new Claim("hwid", hwid!),
                    new Claim("key", key!)
                }),
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: new SigningCredentials(new RsaSecurityKey(devKeys.RsaSignKey), SecurityAlgorithms.RsaSha256)
            );

            var result = EncodingFunctions.EncodeAesJwt(handler.WriteToken(token),devKeys);

            return Results.Json(new { Error = "none", Result = result });
        }


    }


}
