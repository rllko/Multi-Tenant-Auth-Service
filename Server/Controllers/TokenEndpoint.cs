using Authentication.Services;
using Authentication.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.OAuth;

internal static class TokenEndpoint
{
    [HttpPost]
    public static IResult Handle(
        HttpContext httpContext,
        [FromServices] IAuthorizeResultService authorizeResultService,
        [FromServices] DevKeys devKeys)
    {
        var result = authorizeResultService
            .GenerateToken(httpContext, devKeys);

        if (result.HasError)
            return Results.Json(new
            {
                Error = "Something happened during token creation",
                Debug = result.Error
            });

        return Results.Ok(new
        {
            result.AccessToken,
            IdentityToken = result.IdToken,
            result.TokenType,
            Scope = result.RequestedScopes,
            ExpiresIn = DateTime.UtcNow.AddMinutes(30)
        });
    }
}