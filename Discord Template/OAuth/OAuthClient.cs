using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Polly;
using Polly.Contrib.WaitAndRetry;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace DiscordTemplate.AuthClient
{
    internal class OAuthClient : IOAuthClient
    {
        private readonly HttpClient _httpClient;
        private readonly ApiConfiguration? _api;
        private static TokenResponse? lastToken;

        private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy = Policy<HttpResponseMessage>.Handle<HttpRequestException>().OrResult(delegate(HttpResponseMessage x)
        {
            HttpStatusCode statusCode = x.StatusCode;
            return (statusCode >= HttpStatusCode.InternalServerError || statusCode == HttpStatusCode.RequestTimeout) ? true : false;
        }).WaitAndRetryAsync(Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(2L), 5));


        public OAuthClient(HttpClient httpClient, IConfigurationRoot configuration)
        {
            _httpClient = httpClient;
            _api = configuration.GetSection("ApiConfiguration").Get<ApiConfiguration>();

            if(_api == null)
            {
                throw new Exception("API CONFIGURATION FILE NOT FOUND");
            }
        }


        private async Task<AuthenticationResponse?> GetCode()
        {
            var code_verifier = generateCodeChallenge();

            // Create the URL -> please change this later

            var query =
            $"?Response_type={_api.Response_type}" +
            $"&client_id={_api.ClientId}" +
            $"&code_challenge=" + code_verifier +
            $"&Code_challenge_method={_api.Code_challenge_method}" +
            $"&Scope={_api.Scope}" +
            $"&State={_api.State}";

            // Create Request and add headers

            // Send Request
            var httpResponseMessage = await _retryPolicy.ExecuteAsync(() =>
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, _api.AuthorizationEndpoint + query);
                request.Headers.Add("Accept", "application/json");


                return _httpClient.SendAsync(request);
            });

            // Get the response as JSON and Deserialize it
            var responseAsJson = await httpResponseMessage.Content.ReadAsStringAsync();

            if(httpResponseMessage.StatusCode != HttpStatusCode.OK)
            {
                return null;
            }

            httpResponseMessage.EnsureSuccessStatusCode();

            var authorizationResponse = JsonConvert.DeserializeObject<AuthenticationResponse>(responseAsJson);

            // Rerturn the Access Token
            return authorizationResponse;
        }

        public async Task<TokenResponse?> GetAccessToken()
        {
            if(lastToken?.ExpiresIn < DateTime.Now)
            {
                lastToken.ExpiresIn = DateTime.UtcNow.AddMinutes(30.0);
                return lastToken;
            }
            var authenticationResponse = await GetCode();

            if(authenticationResponse == null)
            {
                return null;
            }

            var TokenResponse = await RetrieveAcessToken(authenticationResponse.code);
            string value = await TokenResponse.Content.ReadAsStringAsync();

            return lastToken = JsonConvert.DeserializeObject<TokenResponse>(value);
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

        private async Task<HttpResponseMessage> RetrieveAcessToken(string authorizationCode)
        {
            return await _retryPolicy.ExecuteAsync(
               () =>
               {
                   HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, _api.TokenEndpoint)
                   {
                       Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "grant_type", "authorization_code" },
                    { "client_id", _api.ClientId! },
                    { "client_secret", _api.ClientSecret! },
                    { "code", authorizationCode }
                }),
                       Headers = { { "Accept", "application/json" } }
                   };
                   return _httpClient.SendAsync(request);
               });
        }

        #endregion
    }

    #region Helper Classes

    public sealed class AuthenticationResponse : IProtectedEndpoint
    {

        public string code { get; set; }
        public double expiresIn { get; set; }
        public List<string> scope { get; set; }
        public string tokenType { get; set; }
    }

    public sealed class TokenResponse : IProtectedEndpoint
    {
        public string AccessToken { get; set; }

        public string? IdentityToken { get; set; }

        public string TokenType { get; set; }

        public DateTime ExpiresIn { get; set; }

        public string Scope { get; set; }
    }

    public abstract class IProtectedEndpoint
    {
        public string? Error { init; get; }
        public string? StackTrace { init; get; }
    }


    #endregion  
}
