using HeadHunter.Common;
using HeadHunter.Context;
using HeadHunter.OauthResponse;
using HeadHunter.Services;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Endpoints
{
    [Authorize(Policy = "Special")]
    public class ClientRedeemEndpoint
    {
        [HttpPost]
        public async static Task<IResult> Handle(HttpContext httpContext,
            [FromServices] IUserManagerService userManagerService,
            HeadhunterDbContext dbContext,
            ICodeStorageService codeStorage,
            DevKeys devKeys)
        {
            var Request = httpContext.Request;

            Request.Form.TryGetValue("3391056346", out var Hwid);
            Request.Form.TryGetValue("3917505287", out var License);

            if(string.IsNullOrEmpty(Hwid) || string.IsNullOrEmpty(License) || License.ToString().Length < 36)
            {
                await httpContext.Response.WriteAsJsonAsync(new { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
                return Results.NotFound();
            }

            var user = await userManagerService.GetUserByLicenseAsync(License!);

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


            var discordCode = codeStorage.CreateDiscordCode(dbContext,License!,Hwid!);


            return Results.Json(new { Error = "none", Result = discordCode });
        }


    }


}
