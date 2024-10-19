using HeadHunter.Services;
using HeadHunter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    internal static class TokenEndpoint
    {
        [HttpPost]
        public static async Task<IResult> Handle(
            HttpContext httpContext,
            [FromServices] IAuthorizeResultService authorizeResultService,
            [FromServices] DevKeys devKeys)
        {

            var result =  authorizeResultService
                .GenerateToken(httpContext,devKeys);

            if(result.HasError)
                return Results.Json(new
                {
                    Error = "Something happened during token creation",
                    Debug = result.Error.ToString()
                });

            return Results.Ok(new
            {
                AccessToken = result.AccessToken,
                IdentityToken = result.IdToken,
                TokenType = result.TokenType,
                Scope = result.RequestedScopes,
                ExpiresIn = DateTime.UtcNow.AddMinutes(30)
            });
        }
    }
}
