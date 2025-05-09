using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

namespace Authentication.Services.Clients;

public interface IClientService
{
    Task<int> CreateClientAsync(Client client);
    Task<Client?> GetClientByIdentifierAsync(string identifier);
    Task<IEnumerable<Client>> GetAllClientsAsync();
    Task<bool> DeleteClientAsync(int clientId);
}