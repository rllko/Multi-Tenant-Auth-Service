using Authentication.Endpoints;
using Authentication.Endpoints.Authorization;
using Authentication.Endpoints.Token;

namespace Authentication.Services.Authentication.AuthorizeResult;

public interface IAuthorizeResultService
{
    Task<Result<AuthorizeResponse, ValidationFailed>> AuthorizeRequestAsync(HttpContext httpContextAccessor,
        AuthorizeRequest authorizeRequest);

    Task<Result<TokenResponse, ValidationFailed>> GenerateToken(TokenRequest tokenRequest);
}