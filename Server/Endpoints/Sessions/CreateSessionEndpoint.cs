// using Authentication.Models.Entities;
// using Authentication.Services.Licenses;
// using Authentication.Services.UserSessions;
// using FastEndpoints;
//
// namespace Authentication.Endpoints.Sessions;
//

//
// public class CreateSessionEndpoint(
//     ILicenseService licenseService,
//     IUserSessionService sessionService)
//     : Endpoint<CreateSessionRequest, Result<string, ValidationFailed>>
// {
//     public override void Configure()
//     {
//         AllowFormData();
//         Post("/sessions");
//     }
//
//     public override Task HandleAsync(CreateSessionRequest req, CancellationToken ct)
//     {
//         var user = await licenseService.GetLicenseByValueAsync(Guid.Parse(License!));
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

