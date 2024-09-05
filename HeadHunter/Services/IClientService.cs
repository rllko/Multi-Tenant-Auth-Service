using HeadHunter.Models;
using Microsoft.IdentityModel.Tokens;

namespace HeadHunter.Services
{
    public interface IClientService
    {
        CheckClientResult VerifyClientById(string clientId, bool checkWithSecret = false, string clientSecret = null,
         string grantType = null);

        bool SearchForClientBySecret(string grantType);
        AudienceValidator ValidateAudienceHandler(IEnumerable<string> audiences, SecurityToken securityToken,
            TokenValidationParameters validationParameters, Client client, string token);

        Task<CheckClientResult> GetClientByUriAsync(string clientUrl);

        Task<CheckClientResult> GetClientByIdAsync(string clientId);
    }
}
