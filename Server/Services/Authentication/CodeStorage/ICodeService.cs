using Authentication.Models;

namespace Authentication.Services.Authentication.CodeStorage;

public interface ICodeService
{
    Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest);
    Task<AuthorizationCodeRequest?> GetClientCode(string key);
    Task RemoveClientCode(string key);
}