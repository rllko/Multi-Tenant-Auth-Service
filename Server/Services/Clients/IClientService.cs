using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

namespace Authentication.Services.Clients;

public interface IClientService
{
    public Task<Client?> GetClientByIdentifierAsync(string id);
}