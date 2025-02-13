namespace Authentication.Models;

public class AuthorizationCodeRequest
{
    public required string? ClientIdentifier { get; set; }
    public DateTime CreationTime { get; set; } = DateTime.UtcNow.ToUniversalTime();
    public string? CodeChallenge { get; set; } = null;
    public string? CodeChallengeMethod { get; set; } = null;

    public bool IsExpired => DateTime.UtcNow.ToUniversalTime() > CreationTime.AddSeconds(30);
}