using HeadHunter.OauthResponse;

namespace HeadHunter.Services
{
    public interface IAuthorizeResultService
    {
        AuthorizeResponse AuthorizeRequest(ref HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
        TokenResponse GenerateTokenAsync(HttpContext context);
    }
}
