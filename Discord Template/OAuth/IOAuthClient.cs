namespace DiscordTemplate.AuthClient
{
    public interface IOAuthClient
    {
        //Task<AuthorizationResponse?> GetCode();
        Task<TokenResponse?> GetAccessToken();
    }
}
