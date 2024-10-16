using HeadHunter.OauthRequest;
using HeadHunter.OauthResponse;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Services.Interfaces
{
    public interface IAuthorizeResultService
    {
        AuthorizeResponse AuthorizeRequest(HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
        Task<TokenResponse> GenerateTokenAsync(HttpContext context, [FromServices] DevKeys devKeys);
    }
}
