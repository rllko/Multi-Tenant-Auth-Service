namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public class AuthorizeResponse
{
    public string? AccessToken { get; set; } = null;
    public string? State { get; set; }

    //public string GrantType { get; set; }
    public string Issuer { get; set; } = "https://api.rikko.space";
}