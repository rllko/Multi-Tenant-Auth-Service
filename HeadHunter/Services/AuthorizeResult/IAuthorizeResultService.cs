using HeadHunter.OauthRequest;
using HeadHunter.OauthResponse;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Services.Interfaces
{
    public interface IAuthorizeResultService
    {
        AuthorizeResponse AuthorizeRequest(HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
        TokenResponse GenerateToken(HttpContext context, [FromServices] DevKeys devKeys);
    }
}
