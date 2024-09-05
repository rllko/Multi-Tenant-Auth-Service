namespace HeadHunter.Models
{
    public class ClientStore
    {
        public IEnumerable<Client> Clients =
        [
            new Client
            {
                Clientid = "defaultChangeLater",
                Clientsecret = "123456789",
                Allowedscopes = ["openid", "generateKey","AssociateDiscord","profiles"],
                Granttype = GrantTypes.Code.ToString(),
                Clienturi = "https://localhost:5420",
                Redirecturi = "https://localhost:7016/signin-oidc"
            }
        ];
    }
}
