using HeadHunter.Common;
using HeadHunter.Services;
using HeadHunter.Services.ClientComponents;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace HeadHunter.Endpoints
{
    public static class ClientLoginEndpoint
    {

        [HttpGet("{key:guid}")]
        public async static Task<IResult> HandleGet(HttpContext httpContext,
            IUserManagerService userManagerService,
            ISoftwareComponents softwareComponents,
            [FromServices] DevKeys _devKeys)
        {

            if(httpContext.Request.Query.TryGetValue("3917505287", out var License) == false ||
                httpContext.Request.Query.TryGetValue("3391056346", out var Hwid) == false)
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
                return Results.BadRequest(new { Error = "License is invalid" });
            }

            // check if the user has a hwid and if it matches the one provided
            var hwidList = Hwid.ToString().Split(' ').ToList();

            if(hwidList.Count is not 5)
            {
                httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                await httpContext.Response.WriteAsJsonAsync(new { Error = "Invalid hwid list" });
                return Results.Conflict();
            }

            if(userKey.Hwid == null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status200OK;
                await httpContext.Response.WriteAsJsonAsync(new { Error = "birdy, send a post request to this endpoint." });
                return Results.Conflict();
            }

            var validHwid = false;
            hwidList.ForEach(x =>
            {
                if(userKey.Hwid.Contains(x) is true)
                {
                    validHwid = true;
                }
            });

            if(validHwid is false)
            {
                return Results.BadRequest(new { Error = "Invalid HWID" });
            }

            // check if the user has confirmed their discord account
            if(userKey.DiscordUser == null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                await httpContext.Response.WriteAsJsonAsync(new { Error = "License is not confirmed." });
                return Results.Conflict();
            }

            if(await userManagerService.UpdateLicensePersistenceTokenAsync(userKey.License) == false)
            {
                return Results.BadRequest(new { Error = "Failed While updating token" });
            }

            // Create Handler for JWT
            var handler = new JwtSecurityTokenHandler();

            // Create token to send to the user
            var tokenDescriptor = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey,_devKeys);

            if(tokenDescriptor == null)
            {
                return Results.BadRequest(new { Error = "Failed to generate token" });
            }

            // create the token string
            string token = handler.WriteToken(handler.CreateToken(tokenDescriptor));
            // turn token into bytes
            byte[] jwtBytes = Encoding.UTF8.GetBytes(token);

            // separates in 215 byte chunks
            var payload = jwtBytes.Chunk(215);
            try
            {
                var result = new List<string>();

                foreach(var item in payload)
                {
                    result.Add(System.Convert.ToBase64String(_devKeys.RsaEncryptKey.Encrypt(item, RSAEncryptionPadding.Pkcs1)));
                }

                return Results.Json(new { Error = "None", Result = result });
            }
            catch(Exception e)
            {
                return Results.BadRequest(new { Error = e.Message });
            }
        }

        [HttpPost]
        public async static Task<IResult> HandlePost(HttpContext httpContext, IUserManagerService userManagerService)
        {
            if(httpContext.Request.Form.TryGetValue("3391056346", out var Hwid) == false ||
               httpContext.Request.Form.TryGetValue("3917505287", out var License) == false)
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(License))
            {
                return Results.NotFound();
            }
            var user = await userManagerService.GetUserByLicenseAsync(License!);
            if(user == null)
            {
                return Results.NotFound();
            }

            if(user.DiscordUser == null)
            {
                return Results.Json(new { Error = "No discord user assigned." });
            }

            if(user.Hwid != null)
            {
                return Results.Json(new { Error = "Key already assigned." });
            }

            var hwidList = Hwid.ToString().Split('+').ToList();

            if(hwidList.Count is > 5 or <= 0)
            {
                return Results.BadRequest(new { Error = "Invalid HWID" });
            }

            await userManagerService.AssignLicenseHwidAsync(License.ToString(), hwidList);
            return Results.Json(new { Error = "none", Message = "Success!" });
        }
    }
}
