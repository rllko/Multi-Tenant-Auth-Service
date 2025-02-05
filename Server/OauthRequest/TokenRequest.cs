namespace Authentication.OauthRequest;

public class TokenRequest
{
    public required string? client_id { get; set; }
    public required string client_secret { get; set; }
    public required string code { get; set; }
    public required string grant_type { get; set; }

    public string? RedirectUri { get; set; } = null;
    //public required string CodeVerifier { get; set; }
}