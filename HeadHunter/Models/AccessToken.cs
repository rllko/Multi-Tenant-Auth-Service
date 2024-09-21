namespace HeadHunter.Models
{
    public class AccessToken
    {
        public string ClientIdentifier { get; set; }
        public string ClientSecret { get; set; }
        public string RedirectUri { get; set; }

        public DateTime CreationTime { get; set; } = DateTime.UtcNow;
        public IList<string> RequestedScopes { get; set; }

        public string Subject { get; set; }
        public string Nonce { get; set; }
        public string CodeChallenge { get; set; }
        public string CodeChallengeMethod { get; set; }
    }
}
