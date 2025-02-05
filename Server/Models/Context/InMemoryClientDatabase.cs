using Authentication.Models.Entities;

namespace Authentication.Models.Context;

public class InMemoryClientDatabase
{
    public IEnumerable<Client> Clients =
    [
        new()
        {
            ClientId = 1,
            ClientIdentifier = "defaultChangeLater",
            ClientSecret = "123456789",
            //sc = ["openid", "generateKey","AssociateDiscord","profiles"],
            GrantType = GrantTypes.Code.ToString(),
            ClientUri = "https://localhost:7016"
        }
    ];
}