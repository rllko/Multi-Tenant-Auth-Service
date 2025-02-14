namespace Authentication.Endpoints.Authorization;

public class AuthorizeResponse
{
    public string? Code { get; set; } = null;
    public string? State { get; set; }

    //public string GrantType { get; set; }
    public string Issuer { get; set; } = "https://api.rikko.space";
}