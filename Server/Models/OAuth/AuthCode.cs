namespace Authentication.Models.OAuth;

public class AuthCode
{
    public required string ClientId { get; set; }
    public required string CodeChallenge { get; set; }
    public required string CodeChallengeMethod { get; set; }
    public DateTime Expiry { get; set; }
}