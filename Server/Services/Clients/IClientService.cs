using Authentication.Models.Entities;

namespace Authentication.Services.Clients;

public interface IClientService
{
    Task<int> CreateClientAsync(Client client);
    Task<Client?> GetClientByIdentifierAsync(string identifier);
    Task<IEnumerable<Client>> GetClientsByApplicationAsync(Guid applicationGuid);
    Task<IEnumerable<Client>> GetClientPermissionsForTeamAsync(Guid applicationGuid);
    Task<IEnumerable<Client>> GetAllClientsAsync();
    Task<bool> DeleteClientAsync(int clientId);
}