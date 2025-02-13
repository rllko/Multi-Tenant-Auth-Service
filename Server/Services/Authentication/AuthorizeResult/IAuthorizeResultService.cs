using Authentication.Controllers.Authorization;
using Authentication.Controllers.Token;
using Authentication.OauthResponse;
using Authentication.Validators;

namespace Authentication.Services.Authentication.AuthorizeResult;

public interface IAuthorizeResultService
{
    Task<Result<AuthorizeResponse, ValidationFailed>> AuthorizeRequestAsync(HttpContext httpContextAccessor,
        AuthorizeRequest authorizeRequest);

    Task<Result<TokenResponse, ValidationFailed>> GenerateToken(TokenRequest tokenRequest);
}