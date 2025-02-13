namespace Authentication.Controllers.Authorization;

public class AuthorizeResponse
{
    public string? Code { get; set; } = null;

    /// <summary>
    ///     required if it was present in the client authorization request
    /// </summary>
    public string? State { get; set; }

    //public string GrantType { get; set; }
    public string Issuer { get; set; } = "https://api.rikko.space";
}