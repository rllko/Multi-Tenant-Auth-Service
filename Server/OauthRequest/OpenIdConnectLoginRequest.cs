namespace Authentication.OauthRequest;

public class OpenIdConnectLoginRequest
{
    //public string UserName { get; set; }
    //public string Password { get; set; }
    public string? RedirectUri { get; set; }
    public required string Code { get; set; }
    public string? Nonce { get; set; }
    public required IList<string> RequestedScopes { get; set; }
}