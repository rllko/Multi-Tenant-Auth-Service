namespace HeadHunter.Models
{
    public class AccessToken
    {
        public required string ClientIdentifier { get; set; }
        public required string ClientSecret { get; set; }
        public string? RedirectUri { get; set; }

        public DateTime CreationTime { get; set; } = DateTime.UtcNow;
        public  IList<string>? RequestedScopes { get; set; }

        public required string Subject { get; set; }
        public string? Nonce { get; set; }
        public required string CodeChallenge { get; set; }
        public required string CodeChallengeMethod { get; set; }
    }
}
