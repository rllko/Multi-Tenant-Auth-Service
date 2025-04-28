namespace Authentication.Services.Authentication.OAuthAccessToken;

public interface IAccessTokenService
{
    Task<string> Generate(Guid accessCode);

    bool GetByCode(Guid code, out Endpoints.Token.AccessToken? authCode);
    // AuthorizationCodeRequest? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
}