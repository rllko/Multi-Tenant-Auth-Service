namespace HeadHunter.OauthRequest
{
    public class TokenRequest
    {
        public required string ClientId { get; set; }
        public required string ClientSecret { get; set; }
        public required string Code { get; set; }
        public required string GrantType { get; set; }
        public string? RedirectUri { get; set; } = null;
        //public required string CodeVerifier { get; set; }
    }
}
