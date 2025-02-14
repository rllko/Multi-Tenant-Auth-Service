// using Authentication.Endpoints.DiscordOperations;
// using Authentication.Models.Entities;
// using Authentication.Services.Licenses;
// using Authentication.Services.SessionToken;
// using FastEndpoints;
//
// namespace Authentication.Endpoints.Sessions;
//
// public class CreateSessionEndpoint(ILicenseService userManagerService, IUserSessionService userSessionService)
//     : Endpoint<HwidDto,Result<>
// {
//     public override void Configure()
//     {
//         AllowFormData();
//         Post("signin");
//     }
//
//     public override Task HandleAsync(CancellationToken ct)
//     {
//         if (httpContext.Request.Form.TryGetValue("3391056346", out var hwid) == false ||
//             httpContext.Request.Form.TryGetValue("3917505287", out var License) == false)
//             return Results.NotFound();
//
//         if (string.IsNullOrEmpty(License)) return Results.NotFound();
//
//         var response = new DiscordResponse<string>();
//
//         var user = await userManagerService.GetLicenseByValueAsync(Guid.Parse(License!));
//         if (user == null) return Results.BadRequest();
//
//         if (user.DiscordUser == null)
//         {
//             response.Error = "No discord user assigned.";
//             return Results.Json(response);
//         }
//
//         if (user.Hw != null)
//         {
//             response.Error = "Key already assigned. Please reset it through the bot!";
//             return Results.Json(response);
//         }
//
//         var filteredInput = hwid.ToString().Split('+').ToList();
//
//         if (filteredInput.Count is not 5)
//         {
//             response.Error = "Invalid HWID Size";
//             return Results.Json(response);
//         }
//
//         foreach (var item in filteredInput)
//             if (item!.Length is not 64)
//             {
//                 response.Error = "Invalid HWID Format";
//                 return Results.Json(response);
//             }
//
//         var newHwid = new HwidDto(filteredInput[0], filteredInput[1], filteredInput[2],
//             filteredInput[3], filteredInput[4]);
//
//         await userSessionService.CreateLicenseSession(user.Id, null, 1);
//
//         response.Result = "Success!";
//         return Results.Json(response);
//     }
// }

