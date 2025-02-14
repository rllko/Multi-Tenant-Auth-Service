using Authentication.Endpoints.Token;

namespace Authentication.Services.Authentication.OAuthAccessToken;

public interface IAccessTokenStorageService
{
    string Generate(Guid accessCode);

    AccessToken? GetByCode(Guid accessCode);
    // AuthorizationCodeRequest? UpdatedByCode(string key, ClaimsPrincipal claimsPrincipal, IList<string> requestdScopes);
}