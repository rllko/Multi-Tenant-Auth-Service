using Authentication.Models;

namespace Authentication.Services.Authentication.CodeStorage;

public interface ICodeStorageService
{
    Task<string?> CreateAuthorizationCodeAsync(AuthorizationCodeRequest authorizationCodeRequest);
    bool GetClientCode(string key, out AuthorizationCodeRequest? userCode);
    void RemoveClientCode(string key);
}