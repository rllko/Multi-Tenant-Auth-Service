namespace HeadHunter.Models
{
    public class AuthorizationCode
    {
        public required string? ClientIdentifier { get; set; }
        public string? ClientSecret { get; set; } = null;

        public DateTime CreationTime { get; set; } = DateTime.UtcNow.ToUniversalTime();

        public bool IsOpenId { get; set; }
        public required IList<string> RequestedScopes { get; set; }

        public required string Subject { get; set; }
        public string? CodeChallenge { get; set; } = null;
        public string? CodeChallengeMethod { get; set; } = null;

        public bool IsExpired => DateTime.UtcNow.ToUniversalTime() > CreationTime.AddSeconds(30);
    }
}
