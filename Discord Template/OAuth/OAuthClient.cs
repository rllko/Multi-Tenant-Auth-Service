using DiscordTemplate.OAuth;
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

        private readonly Polly.Retry.AsyncRetryPolicy<HttpResponseMessage> _retryPolicy =
            Policy<HttpResponseMessage>
            .Handle<HttpRequestException>()
            .OrResult( x =>
            {
                HttpStatusCode statusCode = x.StatusCode;
                return (statusCode is >= HttpStatusCode.InternalServerError or HttpStatusCode.RequestTimeout);
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
        private async Task<AuthenticationResponse?>  GetCode()
        {
            var code_verifier = GenerateCodeChallenge();

            // Create the URL -> please change this later

            var query =
            $"?response_type={_api!.Response_type}" +
            $"&client_id={_api.ClientId}" +
            $"&code_challenge=" + code_verifier +
            $"&code_challenge_method={_api.Code_challenge_method}" +
            $"&scope={_api.Scope}" +
            $"&state={_api.State}";

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
            #warning You need to implement the endpoint to check if access token is still valid
            if(DateTime.Now.ToUniversalTime() < lastToken?.ExpiresIn.Value.ToUniversalTime())
            {
                return lastToken;
            }
            var authenticationResponse = await GetCode();

            if(authenticationResponse == null)
            {
                return null;
            }
            var tokenResponse = await RetrieveAcessToken(authenticationResponse.Code!);
            
            var value = await tokenResponse.Content.ReadAsStringAsync();
            lastToken = JsonConvert.DeserializeObject<TokenResponse>(value);
            
            return lastToken;
        }

        #region Helper Methods
        private static string GenerateCodeChallenge()
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

            var challengeBytes = SHA256.HashData(Encoding.UTF8.GetBytes(code_verifier));

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
                   var request = new HttpRequestMessage(HttpMethod.Post, _api!.TokenEndpoint)
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
        public string? Code { get; set; }
        public double? ExpiresIn { get; set; }
        public List<string>? Scope { get; set; }
        public string? TokenType { get; set; }
    }

    public sealed class TokenResponse : IProtectedEndpoint
    {
        public string? AccessToken { get; set; }

        public string? IdentityToken { get; set; }

        public string? TokenType { get; set; }

        public DateTime? ExpiresIn { get; set; }

        public string? Scope { get; set; }
    }


    #endregion  
}
