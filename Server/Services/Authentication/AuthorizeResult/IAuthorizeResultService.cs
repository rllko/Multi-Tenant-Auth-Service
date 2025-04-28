using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

namespace Authentication.Services.Authentication.AuthorizeResult;

public interface IAuthorizeResultService
{
    Task<Result<AuthorizeResponse, ValidationFailed>> AuthorizeRequestAsync(HttpContext httpContextAccessor,
        AuthorizeRequest authorizeRequest);

    Task<Result<TokenResponse, ValidationFailed>> GenerateToken(TokenRequest tokenRequest);
}