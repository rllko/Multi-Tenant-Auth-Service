using Authentication.Controllers.Authorization;
using Authentication.Models.Entities.OAuth;
using Authentication.Services.Authentication;

namespace Authentication.Services;

public class ClientService : IClientService
{
    public async Task<Client?> GetClientByIdentifierAsync(string identifier)
    {
        throw new NotImplementedException();
    }

    public async Task<Client> GetClient(AuthorizeRequest clientRequest)
    {
        throw new NotImplementedException();
    }
}