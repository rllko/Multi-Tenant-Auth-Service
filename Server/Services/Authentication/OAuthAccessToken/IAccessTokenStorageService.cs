using Authentication.Endpoints.Token;

namespace Authentication.Services.Authentication.OAuthAccessToken;

public interface IAccessTokenStorageService
{
    string Generate(Guid accessCode);

    bool GetByCode(Guid code, out AccessToken? authCode);
    // AuthorizationCodeRequest? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
}