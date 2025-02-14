// using FastEndpoints;
//
// namespace Authentication.Endpoints.Sessions;
//
// // to resume a session
// public class SessionResumeEndpoint : EndpointWithoutRequest
// {
//     public override void Configure()
//     {
//         base.Configure();
//     }
//
//     public override Task HandleAsync(CancellationToken ct)
//     {
//         if (context.Request.Query.TryGetValue("3917505287", out var License) == false ||
//             context.Request.Query.TryGetValue("3391056346", out var Hwid) == false)
//             return Results.NotFound();
//
//         if (string.IsNullOrEmpty(License)) return Results.NotFound();
//
//         var response = new DiscordResponse<List<string>>();
//
//         var userKey = await userManagerService.GetLicenseByValueAsync(Guid.Parse(
//             License.ToString()));
//
//         if (userKey == null)
//         {
//             response.Error = "License is invalid";
//             return Results.BadRequest(response);
//         }
//
//         // check if the user has a hwid and if it matches the one provided
//         var filteredInput = Hwid.ToString().Split(' ').ToList();
//
//         if (filteredInput.Count is not 5)
//         {
//             context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
//             response.Error = "Invalid hwid list";
//
//             return Results.Json(response);
//         }
//
//         if (userKey.Hw == null)
//         {
//             response.Error = "birdy, send a post request to this endpoint.";
//             return Results.Json(response);
//         }
//
//         var inputHwid = new HwidDto(filteredInput[0], filteredInput[1], filteredInput[2],
//             filteredInput[3], filteredInput[4]);
//         var userHwid = await hwidService.GetHw idByLicenseAsync(userKey);
//         var x = userHwid.Match(x => inputHwid.Equals(inputHwid));
//         if (userKey.Hw!.EqualsCheck(inputHwid) is false)
//         {
//             response.Error = "Invalid HWID";
//             return Results.Json(response);
//         }
//
//         // check if the user has confirmed their discord account
//         if (userKey.DiscordUser == null)
//         {
//             context.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
//             response.Error = "License is not confirmed.";
//
//             await context.Response.WriteAsJsonAsync(response);
//             return Results.Json(response);
//         }
//
//         if (await userManagerService.UpdateLicensePersistenceTokenAsync("") == false)
//         {
//             response.Error = "Failed While updating token";
//             return Results.BadRequest(response);
//         }
//
//         // Create Handler for JWT
//         var handler = new JwtSecurityTokenHandler();
//
//         // Create token to send to the user
//         var tokenDescriptor = EncodingFunctions.GenerateSecurityTokenDescriptor(userKey, _devKeys);
//
//         if (tokenDescriptor == null)
//         {
//             response.Error = "Failed to generate token";
//             return Results.BadRequest(response);
//         }
//
//         await logger.LogActivityAsync(ActivityType.Login, context.Request.Headers["cf-connecting-ip"]!, userKey.Id);
//
//         // create the token string
//         var token = handler.WriteToken(handler.CreateToken(tokenDescriptor));
//         // turn token into bytes
//         var jwtBytes = Encoding.UTF8.GetBytes(token);
//
//         // separates in 215 byte chunks
//         var payload = jwtBytes.Chunk(215);
//         try
//         {
//             var result = new List<string>();
//
//             foreach (var item in payload)
//                 result.Add(Convert.ToBase64String(_devKeys.RsaEncryptKey.Encrypt(item, RSAEncryptionPadding.Pkcs1)));
//
//             response.Result = result;
//             return Results.Json(response);
//         }
//         catch (Exception e)
//         {
//             response.Error = e.Message;
//             return Results.BadRequest(response);
//         }
//     }
// }
//
// }
// }
//
// [Microsoft.AspNetCore.Mvc.HttpGet("{key:guid}")]
// public static async Task<IResult> HandleGet(HttpContext context,
//     ILicenseService userManagerService,
//     ISessionTokenService sessionTokenService,
//     IHwidService hwidService,
//     [FromServices] DevKeys _devKeys, IActivityLogger logger)
// {
// }

