namespace Authentication.Endpoints.Token;

public class AccessToken
{
    public required string? ClientIdentifier { get; set; }
    public DateTime CreationTime { get; set; } = DateTime.UtcNow;
}