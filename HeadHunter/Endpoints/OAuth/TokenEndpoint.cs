using HeadHunter.Services;
using HeadHunter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    public static class TokenEndpoint
    {
        [HttpPost]
        public static async Task<IResult> Handle(HttpContext httpContext, [FromServices] IAuthorizeResultService authorizeResultService, [FromServices] DevKeys devKeys)
        {

            var result =  await authorizeResultService.GenerateTokenAsync(httpContext,devKeys);

            if(result.HasError)
                return Results.Json(new { Error = "Something happened during token creation", Debug = result.Error.ToList() });

            return Results.Ok(new
            {
                access_token = result.access_token,
                id_token = result.id_token,
                token_type = result.token_type,
                scope = result.requested_scopes
            });
        }
    }
}
