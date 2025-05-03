namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public class AccessToken
{
    public required string? ClientIdentifier { get; set; }
    public DateTime CreationTime { get; set; } = DateTime.UtcNow;
}