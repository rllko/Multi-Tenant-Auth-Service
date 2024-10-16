using HeadHunter.Common;
using HeadHunter.Models;
using HeadHunter.OauthRequest;
using HeadHunter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    internal static class AuthorizationEndpoint
    {
        public static IResult Handle(
            HttpContext httpContext,
            [FromServices] IAuthorizeResultService authorizeResultService)

        {
            var request = httpContext.Request;

            request.Query.TryGetValue("response_type", out var responseType);
            request.Query.TryGetValue("client_id", out var clientId);
            request.Query.TryGetValue("code_challenge", out var codeChallenge);
            request.Query.TryGetValue("code_challenge_method", out var codeChallengeMethod);
            request.Query.TryGetValue("scope", out var scope);
            request.Query.TryGetValue("state", out var state);

            if(string.IsNullOrEmpty(responseType) ||
                string.IsNullOrEmpty(clientId) ||
                string.IsNullOrEmpty(codeChallenge) ||
                string.IsNullOrEmpty(codeChallengeMethod) ||
                string.IsNullOrEmpty(scope) ||
                string.IsNullOrEmpty(state))
            {
                return Results.Json(new ExceptionResponse("Invalid Fields given"));
            }


            var authorizationRequest = new AuthorizationRequest
            {
                ResponseType = responseType!,
                ClientId = clientId!,
                CodeChallenge = codeChallenge!,
                code_challenge_method = codeChallengeMethod!,
                Scope = scope!,
                State = state!,
            };


            var result = authorizeResultService.AuthorizeRequest( httpContext, authorizationRequest);

            if(result.HasError)
            {
                Console.WriteLine(result.ErrorDescription);
                return Results.BadRequest(result.ErrorDescription);
            }

            return Results.Json(
                new
                {
                    result.Code,
                    ExpiresIn = TimeSpan.FromMinutes(30).TotalSeconds,
                    Scope = result.RequestedScopes,
                    TokenType = TokenTypeEnum.Bearer.GetEnumDescription()
                });
        }
    }
}
