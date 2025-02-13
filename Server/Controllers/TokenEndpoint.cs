using Authentication.Services;
using Authentication.Services.Authentication.AuthorizeResult;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.OAuth;

internal static class TokenEndpoint
{
    [HttpPost]
    public static async Task<IResult> Handle(
        HttpContext httpContext,
        [FromServices] IAuthorizeResultService authorizeResultService,
        [FromServices] DevKeys devKeys)
    {
        var result = await authorizeResultService
            .GenerateToken(httpContext, devKeys);

        if (result.Item2 is not null)
            return Results.Json(new
            {
                Error = result.Item2.GetEnumDescription()
            });

        return Results.Ok(new
        {
            result.Item1!.AccessToken,
            IdentityToken = result.Item1!.IdToken,
            result.Item1!.TokenType,
            Scope = result.Item1!.RequestedScopes,
            ExpiresIn = DateTime.UtcNow.AddMinutes(30)
        });
    }
}