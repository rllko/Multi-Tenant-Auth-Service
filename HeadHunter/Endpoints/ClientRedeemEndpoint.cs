using HeadHunter.Common;
using HeadHunter.Models.Context;
using HeadHunter.OauthResponse;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints
{

    public class ClientRedeemEndpoint
    {
        [HttpPost]
        public async static Task<IResult> Handle(HttpContext httpContext,
            [FromServices] IUserManagerService userManagerService,
            HeadhunterDbContext dbContext,
            ICodeStorageService codeStorage)
        {
            var Request = httpContext.Request;

            Request.Form.TryGetValue("3917505287", out var License);

            if(string.IsNullOrEmpty(License) || License.ToString().Length < 36)
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

            if(user.DiscordUser != null)
            {
                return Results.Json(new { Error = "Key is already confirmed." });
            }

            var discordCode = codeStorage.CreateDiscordCode(dbContext,License!);

            return Results.Json(new { Error = "none", Result = discordCode });
        }


    }


}
