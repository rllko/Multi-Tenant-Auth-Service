namespace HeadHunter.OauthRequest
{
    public class AuthorizationRequest
    {
        public AuthorizationRequest() { }
        /// <summary>
        /// Response Type, is required
        /// </summary>
        public string ResponseType { get; init; }

        /// <summary>
        /// Client Id, is required
        /// </summary>

        public string ClientId { get; init; }

        /// <summary>
        /// Optional
        /// </summary>
        public string Scope { get; init; }

        /// <summary>
        /// Return the State in the result 
        /// if it was present in the client authorization request
        /// </summary>
        public string State { get; init; }

        /// <summary>
        /// if is not null so the client use Pkce
        /// </summary>
        public string CodeChallenge { get; init; }

        /// <summary>
        /// Hasher type for <see cref="CodeChallenge"/>
        /// </summary>
        public string code_challenge_method { get; init; }


    }
}
