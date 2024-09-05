using HeadHunter.OauthRequest;
using HeadHunter.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.OAuth
{
    public static class AuthorizationEndpoint
    {
        public static async Task Handle(
            HttpContext httpContext,
            [FromServices] IAuthorizeResultService authorizeResultService,
            [FromServices] IDataProtectionProvider dataProtectionProvider)
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
            request.Query.TryGetValue("nonce", out var nonce);

            var authorizationRequest = new AuthorizationRequest
            {
                response_type = responseType,
                client_id = clientId,
                nonce = nonce,
                code_challenge = codeChallenge,
                code_challenge_method = codeChallengeMethod,
                scope = scope,
                state = state,
                redirect_uri = redirectUri
            };

            var result = authorizeResultService.AuthorizeRequest(ref httpContext, authorizationRequest);

            if(result.HasError)
            {
                httpContext.Response.Redirect("/error");
                return;
            }

            var loginModel = new OpenIdConnectLoginRequest
            {
                RedirectUri = result.RedirectUri,
                Code = result.Code,
                RequestedScopes = result.RequestedScopes,
                Nonce = result.Nonce,
            };

            httpContext.Response.Redirect(loginModel.RedirectUri);
        }
    }
}
