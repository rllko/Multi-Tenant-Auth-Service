using Authentication.Models.Entities.OAuth;
using Authentication.OauthRequest;

namespace Authentication.Services.Authentication;

public interface IClientService
{
    public Task<Client?> GetClientByIdentifierAsync(string identifier);
    public Task<Client> GetClient(AuthorizationRequest clientRequest);
}