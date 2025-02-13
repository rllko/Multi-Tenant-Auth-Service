using Authentication.Controllers.Authorization;
using Authentication.Models.Entities.OAuth;

namespace Authentication.Services.Authentication;

public interface IClientService
{
    public Task<Client?> GetClientByIdentifierAsync(string identifier);
    public Task<Client> GetClient(AuthorizeRequest clientRequest);
}