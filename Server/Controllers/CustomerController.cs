using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Authentication.Common;
using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.ActivityLogger;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints;

public static class CustomerController
{
    [HttpGet("{key:guid}")]
    public static async Task<IResult> HandleGet(HttpContext context,
        ILicenseManagerService userManagerService,
        [FromServices] DevKeys _devKeys, IActivityLogger logger)
    {
        if (context.Request.Query.TryGetValue("3917505287", out var License) == false ||
            context.Request.Query.TryGetValue("3391056346", out var Hwid) == false)
            return Results.NotFound();

        if (string.IsNullOrEmpty(License)) return Results.NotFound();

        var response = new DiscordResponse<List<string>>();

        var userKey = await userManagerService.GetLicenseByLicenseAsync(License!);

        if (userKey == null)
        {
            response.Error = "License is invalid";
            return Results.BadRequest(response);
        }

        // check if the user has a hwid and if it matches the one provided
        var filteredInput = Hwid.ToString().Split(' ').ToList();

        if (filteredInput.Count is not 5)
        {
            context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
            response.Error = "Invalid hwid list";

            return Results.Json(response);
        }

        if (userKey.Hw == null)
        {
            response.Error = "birdy, send a post request to this endpoint.";
            return Results.Json(response);
        }

        var inputHwid = new Hwid(cpu: filteredInput[0], bios: filteredInput[1], ram: filteredInput[2],
            disk: filteredInput[3], display: filteredInput[4]);

        if (userKey.Hw!.EqualsCheck(inputHwid) is false)
        {
            response.Error = "Invalid HWID";
            return Results.Json(response);
        }

        // check if the user has confirmed their discord account
        if (userKey.DiscordUser == null)
        {
            context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
            response.Error = "License is not confirmed.";

            await context.Response.WriteAsJsonAsync(response);
            return Results.Json(response);
        }

        if (await userManagerService.UpdateLicensePersistenceTokenAsync("") == false)
        {
            response.Error = "Failed While updating token";
            return Results.BadRequest(response);
        }

        // Create Handler for JWT
        var handler = new JwtSecurityTokenHandler();

        // Create token to send to the user
        var tokenDescriptor = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey, _devKeys);

        if (tokenDescriptor == null)
        {
            response.Error = "Failed to generate token";
            return Results.BadRequest(response);
        }

        await logger.LogActivityAsync(ActivityType.Login, context.Request.Headers["cf-connecting-ip"]!, userKey.Id);

        // create the token string
        var token = handler.WriteToken(handler.CreateToken(tokenDescriptor));
        // turn token into bytes
        var jwtBytes = Encoding.UTF8.GetBytes(token);

        // separates in 215 byte chunks
        var payload = jwtBytes.Chunk(215);
        try
        {
            var result = new List<string>();

            foreach (var item in payload)
                result.Add(Convert.ToBase64String(_devKeys.RsaEncryptKey.Encrypt(item, RSAEncryptionPadding.Pkcs1)));

            response.Result = result;
            return Results.Json(response);
        }
        catch (Exception e)
        {
            response.Error = e.Message;
            return Results.BadRequest(response);
        }
    }

    [HttpPost]
    public static async Task<IResult> HandlePost(HttpContext httpContext, ILicenseManagerService userManagerService)
    {
        if (httpContext.Request.Form.TryGetValue("3391056346", out var hwid) == false ||
            httpContext.Request.Form.TryGetValue("3917505287", out var License) == false)
            return Results.NotFound();

        if (string.IsNullOrEmpty(License)) return Results.NotFound();

        var response = new DiscordResponse<string>();

        var user = await userManagerService.GetLicenseByLicenseAsync(License!);
        if (user == null) return Results.BadRequest();

        if (user.DiscordUser == null)
        {
            response.Error = "No discord user assigned.";
            return Results.Json(response);
        }

        if (user.Hw != null)
        {
            response.Error = "Key already assigned. Please reset it through the bot!";
            return Results.Json(response);
        }

        var filteredInput = hwid.ToString().Split('+').ToList();

        if (filteredInput.Count is not 5)
        {
            response.Error = "Invalid HWID Size";
            return Results.Json(response);
        }

        foreach (var item in filteredInput)
            if (item!.Length is not 64)
            {
                response.Error = "Invalid HWID Format";
                return Results.Json(response);
            }

        var newHwid = new Hwid(cpu: filteredInput[0], bios: filteredInput[1], ram: filteredInput[2],
            disk: filteredInput[3], display: filteredInput[4]);

        await userManagerService.AssignLicenseHwidAsync(License.ToString(), newHwid);

        response.Result = "Success!";
        return Results.Json(response);
    }
}