using HeadHunter.OauthRequest;
using HeadHunter.OauthResponse;

namespace HeadHunter.Services.Interfaces
{
    public interface IAuthorizeResultService
    {
        AuthorizeResponse? AuthorizeRequest(ref HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
        Task<TokenResponse> GenerateTokenAsync(HttpContext context);
    }
}
