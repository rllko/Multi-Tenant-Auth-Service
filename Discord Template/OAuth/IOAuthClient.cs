namespace DiscordTemplate.AuthClient
{
    public interface IOAuthClient
    {
        //Task<AuthenticationResponse?> GetCode();
        Task<TokenResponse?> GetAccessToken();
    }
}
