using HeadHunter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    public static class TokenEndpoint
    {
        public static IResult Handle(HttpContext httpContext, [FromServices] IAuthorizeResultService authorizeResultService)
        {
            var result = authorizeResultService.GenerateTokenAsync(httpContext);

            if(result.HasError)
                return Results.Json(new { Error = "Something happened during token creation", Debug = result.Error.ToList() });

            return Results.Json(result);
        }
    }
}
