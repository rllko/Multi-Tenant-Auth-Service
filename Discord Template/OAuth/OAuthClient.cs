using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace DiscordTemplate.AuthClient
{
    internal class OAuthClient : IOAuthClient
    {
        private readonly HttpClient _httpClient;
        private readonly ApiConfiguration? _api;

        public OAuthClient(HttpClient httpClient, IConfigurationRoot configuration)
        {
            _httpClient = httpClient;
            _api = configuration.GetSection("ApiConfiguration").Get<ApiConfiguration>();
        }


        private async Task<AuthorizationResponse?> GetCode()
        {

            if(_api == null)
            {
                return null;
            }

            var code_verifier = generateCodeChallenge();

            // Create the URL -> please change this later

            var query =
            $"?response_type={_api.response_type}" +
            $"&client_id={_api.clientId}" +
            $"&code_challenge=" + code_verifier +
            $"&code_challenge_method={_api.code_challenge_method}" +
            $"&scope={_api.scope}" +
            $"&state={_api.state}";

            // Create Request and add headers
            using var request = new HttpRequestMessage(HttpMethod.Get, _api.authorizationEndpoint + query);

            request.Headers.Add("Accept", "application/json");

            // Send Request
            var httpResponseMessage = await _httpClient.SendAsync(request);

            // Get the response as JSON and Deserialize it
            var responseAsJson = await httpResponseMessage.Content.ReadAsStringAsync();
            httpResponseMessage.EnsureSuccessStatusCode();

            var authorizationResponse = JsonConvert.DeserializeObject<AuthorizationResponse>(responseAsJson);

            // Rerturn the Access Token
            return authorizationResponse;
        }

        public async Task<TokenResponse?> GetAccessToken()
        {
            var authorizationResponse = await GetCode();

            if(authorizationResponse == null)
            {
                return null;
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, _api.tokenEndpoint);
            request.Headers.Add("Accept", "application/json");

            // Build up the data to POST.
            var parameters =

            request.Content = new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "client_id", _api.clientId },
                { "client_secret", _api.clientSecret },
                { "code", authorizationResponse.code },
                { "redirect_uri", _api.redirect_uri }
            });

            // Post to the Server and parse the response.
            var httpResponseMessage = await new HttpClient().SendAsync(request);
            httpResponseMessage.EnsureSuccessStatusCode();

            var responseAsJson = await httpResponseMessage.Content.ReadAsStringAsync();
            var TokenRequest = JsonConvert.DeserializeObject<TokenResponse>(responseAsJson);
            Console.WriteLine(TokenRequest.AccessToken);
            return TokenRequest;
        }

        #region Helper Methods
        private string generateCodeChallenge()
        {
            var rng = RandomNumberGenerator.Create();

            var bytes = new byte[32];
            rng.GetBytes(bytes);

            // It is recommended to use a URL-safe string as code_verifier.
            // See section 4 of RFC 7636 for more details.
            var code_verifier = Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

            using var sha256 = SHA256.Create();

            var challengeBytes = sha256.ComputeHash(
                 Encoding.UTF8.GetBytes(code_verifier));

            return Convert.ToBase64String(challengeBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        #endregion
    }

    #region Helper Classes

    public sealed class AuthorizationResponse
    {
        public string code { get; set; }
        public double expiresIn { get; set; }
        public List<string> scope { get; set; }
        public string tokenType { get; set; }
    }

    public sealed class TokenResponse
    {
        public string AccessToken { get; set; }
        public string? IdentityToken { get; set; }
        public string TokenType { get; set; }
        public double ExpiresIn { get; set; }
        public string Scope { get; set; }
    }

    #endregion  
}
