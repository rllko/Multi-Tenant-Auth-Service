using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Authentication.Endpoints.Authorization;

namespace Authentication.Services.Clients;

public interface IClientService
{
    public Task<Client?> GetClientByIdentifierAsync(string id);
}