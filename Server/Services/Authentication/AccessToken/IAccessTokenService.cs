namespace Authentication.Services.Authentication.AccessToken;

public interface IAccessTokenService
{
    Task<string> Generate(Guid accessCode);

    bool GetByCode(Guid code, out Endpoints.Authentication.OAuth.TokenEndpoint.AccessToken? authCode);
    // AuthorizationCodeRequest? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
}