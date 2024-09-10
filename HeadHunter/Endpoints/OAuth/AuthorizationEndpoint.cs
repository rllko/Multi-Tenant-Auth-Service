using HeadHunter.OauthRequest;
using HeadHunter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    public static class AuthorizationEndpoint
    {
        public async static Task<IResult> Handle(
            HttpContext httpContext,
            [FromServices] IAuthorizeResultService authorizeResultService)


        {
            var request = httpContext.Request;

            //if(request.Query.Count == 0 || request.Query.Count != 11)
            //{
            //    httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            //    return;
            //}

            request.Query.TryGetValue("response_type", out var responseType);
            request.Query.TryGetValue("client_id", out var clientId);
            request.Query.TryGetValue("redirect_uri", out var redirectUri);
            request.Query.TryGetValue("code_challenge", out var codeChallenge);
            request.Query.TryGetValue("code_challenge_method", out var codeChallengeMethod);
            request.Query.TryGetValue("scope", out var scope);
            request.Query.TryGetValue("state", out var state);


            var authorizationRequest = new AuthorizationRequest
            {
                response_type = responseType,
                client_id = clientId,
                code_challenge = codeChallenge,
                code_challenge_method = codeChallengeMethod,
                scope = scope,
                state = state,
                redirect_uri = redirectUri
            };

            var result = await authorizeResultService.AuthorizeRequest( httpContext, authorizationRequest);

            if(result.HasError)
            {
                return Results.BadRequest(result.ErrorDescription);
            }

            return Results.Redirect(result.RedirectUri);
        }
    }
}
