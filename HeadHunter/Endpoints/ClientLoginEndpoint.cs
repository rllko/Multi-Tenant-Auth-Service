using HeadHunter.Common;
using HeadHunter.Models.Entities;
using HeadHunter.Services;
using HeadHunter.Services.ActivityLogger;
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
        public async static Task<IResult> HandleGet(HttpContext context,
            IUserManagerService userManagerService,
            [FromServices] DevKeys _devKeys, IActivityLogger logger)
        {

            if(context.Request.Query.TryGetValue("3917505287", out var License) == false ||
                context.Request.Query.TryGetValue("3391056346", out var Hwid) == false)
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(License))
            {
                return Results.NotFound();
            }

            var response = new DiscordResponse<List<string>>();

            var userKey = await userManagerService.GetUserByLicenseAsync(License!);

            if(userKey == null)
            {
                response.Error = "License is invalid";
                return Results.BadRequest(response);
            }

            // check if the user has a hwid and if it matches the one provided
            var filteredInput = Hwid.ToString().Split(' ').ToList();

            if(filteredInput.Count is not 5)
            {
                context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                response.Error = "Invalid hwid list";

                return Results.Json(response);
            }

            if(userKey.Hwid == null)
            {
                response.Error = "birdy, send a post request to this endpoint.";
                return Results.Json(response);
            }

            var inputHwid = new Hwid()
            {
                Cpu  = filteredInput[0],
                Bios = filteredInput[1],
                Ram  = filteredInput[2],
                Disk = filteredInput[3],
                Display = filteredInput[4]
            };

            if(userKey.Hw!.EqualsCheck(inputHwid) is false)
            {
                response.Error = "Invalid HWID";
                return Results.Json(response);
            }

            // check if the user has confirmed their discord account
            if(userKey.DiscordUser == null)
            {
                context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
                response.Error = "License is not confirmed.";

                await context.Response.WriteAsJsonAsync(response);
                return Results.Json(response);
            }

            if(await userManagerService.UpdateLicensePersistenceTokenAsync(userKey.License) == false)
            {
                response.Error = "Failed While updating token";
                return Results.BadRequest(response);
            }

            // Create Handler for JWT
            var handler = new JwtSecurityTokenHandler();

            // Create token to send to the user
            var tokenDescriptor = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey,_devKeys);

            if(tokenDescriptor == null)
            {
                response.Error = "Failed to generate token";
                return Results.BadRequest(response);
            }

            await logger.LogActivityAsync( ActivityType.Login, context.Request.Headers ["cf-connecting-ip"]!,userKey.Id);

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

                response.Result = result;
                return Results.Json(response);
            }
            catch(Exception e)
            {
                response.Error = e.Message;
                return Results.BadRequest(response);
            }
        }

        [HttpPost]
        public async static Task<IResult> HandlePost(HttpContext httpContext, IUserManagerService userManagerService)
        {
            if(httpContext.Request.Form.TryGetValue("3391056346", out var hwid) == false ||
               httpContext.Request.Form.TryGetValue("3917505287", out var License) == false)
            {
                return Results.NotFound();
            }

            if(string.IsNullOrEmpty(License))
            {
                return Results.NotFound();
            }

            var response = new DiscordResponse<string>();

            var user = await userManagerService.GetUserByLicenseAsync(License!);
            if(user == null)
            {
                return Results.BadRequest();
            }

            if(user.DiscordUser == null)
            {
                response.Error = "No discord user assigned.";
                return Results.Json(response);
            }

            if(user.Hwid != null)
            {
                response.Error = "Key already assigned. Please reset it through the bot!";
                return Results.Json(response);
            }

            var filteredInput = hwid.ToString().Split('+').ToList();

            if(filteredInput.Count is not 5)
            {
                response.Error = "Invalid HWID Size";
                return Results.Json(response);
            }

            foreach(var item in filteredInput)
            {
                if(item!.Length is not 64)
                {
                    response.Error = "Invalid HWID Format";
                    return Results.Json(response);
                }
            }

            var newHwid = new Hwid()
            {
                Cpu = filteredInput[0],
                Bios = filteredInput[1],
                Ram = filteredInput[2],
                Disk = filteredInput[3],
                Display = filteredInput[4]
            };

            await userManagerService.AssignLicenseHwidAsync(License.ToString(), newHwid);

            response.Result = "Success!";
            return Results.Json(response);
        }
    }
}
