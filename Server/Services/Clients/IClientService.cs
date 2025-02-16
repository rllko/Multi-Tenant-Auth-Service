using Authentication.Endpoints.Authorization;

namespace Authentication.Services.Clients;

public interface IClientService
{
    public Task<Client?> GetClientByIdentifierAsync(string id);
    public Task<Client> GetClient(AuthorizeRequest clientRequest);
}