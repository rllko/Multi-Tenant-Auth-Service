namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public class TokenRequest
{
    public required string client_id { get; set; }
    public required Guid code { get; set; }

    public required string grant_type { get; set; }
}