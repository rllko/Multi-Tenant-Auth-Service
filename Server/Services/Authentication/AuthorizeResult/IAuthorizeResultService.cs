using Authentication.OauthRequest;
using Authentication.OauthResponse;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Services.Interfaces;

public interface IAuthorizeResultService
{
    Task<AuthorizeResponse> AuthorizeRequest(HttpContext httpContextAccessor, AuthorizationRequest authorizationRequest);
    Task<Tuple<TokenResponse?, ErrorTypeEnum?>> GenerateToken(HttpContext context, [FromServices] DevKeys devKeys,IValidator<TokenRequest> validator); 
}