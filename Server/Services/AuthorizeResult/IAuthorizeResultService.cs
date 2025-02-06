using Authentication.OauthRequest;
using Authentication.OauthResponse;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Services.Interfaces;

public interface IAuthorizeResultService
{
    AuthorizeResponse AuthorizeRequest(HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
    TokenResponse GenerateToken(HttpContext context, [FromServices] DevKeys devKeys);
}