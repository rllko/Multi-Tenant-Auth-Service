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

            var result =  await authorizeResultService
                .GenerateTokenAsync(httpContext,devKeys);

            if(result.HasError)
                return Results.Json(new
                {
                    Error = "Something happened during token creation",
                    Debug = result.Error.ToString()
                });

            return Results.Ok(new
            {
                AccessToken = result.access_token,
                IdentityToken = result.id_token,
                TokenType = result.token_type,
                Scope = result.requested_scopes,
                ExpiresIn = TimeSpan.FromMinutes(30).TotalSeconds
            });
        }
    }
}
