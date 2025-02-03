using HeadHunter.Models.Entities;

namespace HeadHunter.Models.Context
{
    public class InMemoryClientDatabase
    {
        public IEnumerable<Client> Clients =
        [
            new Client
            {
                ClientId = 1,
                ClientIdentifier = "defaultChangeLater",
                ClientSecret = "123456789",
                //sc = ["openid", "generateKey","AssociateDiscord","profiles"],
                GrantType = GrantTypes.Code.ToString(),
                ClientUri = "https://localhost:7016",
            }
        ];
    }
}
