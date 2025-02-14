// using System.IdentityModel.Tokens.Jwt;
// using Authentication.Common;
// using Authentication.Services;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.IdentityModel.Tokens;
//
// namespace Authentication.Endpoints.Sessions;
//
// internal class RefreshSessionEndpoint
// {
//     [Authorize(Policy = "Special")]
//     internal static async Task<IResult> Handle(HttpContext httpContext, DevKeys keys,
//         ILicenseManagerService userManagerService)
//     {
//         if (!httpContext.Request.Form.TryGetValue("3917505287", out var encryptedJwt)) return Results.NotFound();
//
//         if (string.IsNullOrEmpty(encryptedJwt)) return Results.NotFound();
//
//         var handler = new JwtSecurityTokenHandler();
//         var checkTokenResult = VerifyKey(handler, encryptedJwt!, keys);
//
//         if (!checkTokenResult.IsSuccess) return Results.BadRequest(checkTokenResult.ErrorDescription);
//
//         var token = checkTokenResult.token;
//         if (token == null) return Results.BadRequest("Invalid AuthorizationToken");
//         var userlicense = token.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
//
//         if (string.IsNullOrEmpty(userlicense)) return Results.BadRequest("Invalid AuthorizationToken");
//
//         var externalUser = await userManagerService.GetLicenseByLicenseAsync(userlicense);
//
//         if (externalUser == null) return Results.BadRequest("Invalid License");
//
//         if (checkTokenResult.token!.ValidTo < DateTime.Now)
//             return Results.BadRequest(new { Error = "AuthorizationToken Hasnt Expired yet" });
//
//         // check if the user has confirmed their discord account
//         if (externalUser.DiscordUser == null)
//         {
//             httpContext.Response.StatusCode = StatusCodes.Status412PreconditionFailed;
//             await httpContext.Response.WriteAsJsonAsync(new { Error = "License is not confirmed." });
//             return Results.Conflict();
//         }
//
//         var newToken = EncodingFunctions.GenerateSecurityTokenDescriptor(externalUser, keys);
//
//         var newUser = handler.CreateEncodedJwt(newToken);
//
//         return Results.Json(new { Error = "none", Result = newUser });
//     }
//
//     private static CheckTokenResult VerifyKey(JwtSecurityTokenHandler handler, string encryptedJwt, DevKeys _devKeys)
//     {
//         // Define the parameters for token validation and decryption
//         var tokenValidationParameters = new TokenValidationParameters
//         {
//             ValidIssuer = IdentityData.Issuer,
//             ValidAudience = IdentityData.Audience,
//
//             // RSA Private License used for decryption
//             TokenDecryptionKey = new RsaSecurityKey(_devKeys.RsaEncryptKey),
//             IssuerSigningKeys = new List<SecurityKey> { new RsaSecurityKey(_devKeys.RsaSignKey) },
//
//             // The algorithm for decrypting the symmetric key
//             RequireSignedTokens = true, // Ensures the token is signed
//             ValidateIssuer = true,
//             ValidateAudience = true,
//             ValidateLifetime = true,
//             ClockSkew = TimeSpan.Zero
//         };
//
//         try
//         {
//             SecurityToken validatedToken;
//             handler.ValidateToken(encryptedJwt, tokenValidationParameters, out validatedToken);
//
//             if (validatedToken == null) return new CheckTokenResult { ErrorDescription = "Invalid AuthorizationToken" };
//
//             // Access the claims and information
//             return new CheckTokenResult { token = validatedToken as JwtSecurityToken, IsSuccess = true };
//         }
//         catch (Exception e)
//         {
//             return new CheckTokenResult { ErrorDescription = e.Message };
//             ;
//         }
//     }
// }

