using HeadHunter.Common;
using HeadHunter.Models.Context;
using HeadHunter.OauthResponse;
using HeadHunter.Services.CodeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints
{
    public class ClientRedeemEndpoint
    {
        [Authorize]
        [HttpPost]
        public async static Task<IResult> Handle(HttpContext httpContext,
            [FromServices] ICodeStorageService userManagerService,
            [FromServices] HeadhunterDbContext dbContext)
        {
            var Request = httpContext.Request;

            Request.Form.TryGetValue("3391056346", out var hwid);
            Request.Form.TryGetValue("3917505287", out var key);

            if(string.IsNullOrEmpty(hwid) || string.IsNullOrEmpty(key))
            {
                await httpContext.Response.WriteAsJsonAsync(ErrorTypeEnum.InvalidRequest.GetEnumDescription());
                return Results.BadRequest();
            }

            var user = dbContext.Users.FirstOrDefault(x => x.License == key);

            if(user == null)
            {
                return Results.BadRequest("Key is null or empty.");
            }

            //var key = await userManagerService.GetUserByLicenseAsync(Key);

            //if(key == null)
            //{
            //    await httpContext.Response.WriteAsJsonAsync(ErrorTypeEnum.InvalidRequest.GetEnumDescription());
            //    return Results.BadRequest();
            //}


            //if(key.DiscordUserNavigation.Confirmed == false)
            //{
            //    return Results.BadRequest("Key is not confirmed.");
            //}

            return Results.Ok(key);
        }
    }
}
