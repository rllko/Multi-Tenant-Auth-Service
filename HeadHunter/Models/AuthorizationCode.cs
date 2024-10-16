namespace HeadHunter.Models
{
    public class AuthorizationCode
    {
        public required string ClientIdentifier { get; set; }
        public string ClientSecret { get; set; }

        public DateTime CreationTime { get; set; } = DateTime.UtcNow;

        public bool IsOpenId { get; set; }
        public required IList<string> RequestedScopes { get; set; }

        public string Subject { get; set; }
        public string? CodeChallenge { get; set; }
        public string? CodeChallengeMethod { get; set; }

        public bool IsExpired => DateTime.UtcNow > CreationTime.AddSeconds(30);
    }
}
