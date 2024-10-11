using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace DiscordTemplate.Services.Licenses
{
    internal class LicenseAuthService : ILicenseAuthService
    {
        private class LicenseResponse
        {
            public string? Error { get; set; }

            public List<string>? Result { get; set; }
        }

        private readonly HttpClient _httpClient;
        private readonly ApiConfiguration? _api;

        public LicenseAuthService(HttpClient httpClient, IConfigurationRoot configurationRoot)
        {
            _api = configurationRoot.GetSection("ApiConfiguration").Get<ApiConfiguration>();
            _httpClient = httpClient;

            if(_api == null)
            {
                throw new Exception("Api Configuration is missing in the configuration file.");
            }
        }
        public async Task<string?> CreateKeyAsync(string accessToken, ulong? discordId = null)
        {
            string endpoint = _api.CreateLicenseEndpoint + (discordId.HasValue ? $"?discordId={discordId}" : "");
            using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using HttpResponseMessage response = await _httpClient.SendAsync(request);
            if(response.IsSuccessStatusCode)
            {
                dynamic jsonContent = JsonConvert.DeserializeObject(await response.Content.ReadAsStringAsync());
                return jsonContent.license;
            }
            Console.WriteLine(response.StatusCode.ToString());
            return null;
        }

        public async Task<List<string>?> CreateBulkAsync(string accessToken, int amount)
        {
            string endpoint = $"{_api.CreateBulkLicenseEndpoint}?amount={amount}";
            using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using HttpResponseMessage response = await _httpClient.SendAsync(request);
            if(response.IsSuccessStatusCode)
            {
                LicenseResponse jsonContent = JsonConvert.DeserializeObject<LicenseResponse>(await response.Content.ReadAsStringAsync());
                return jsonContent.Result;
            }
            Console.WriteLine(response.StatusCode.ToString());
            return null;
        }

        public async Task<List<string>?> GetUserLicenses(string accessToken, ulong id)
        {
            string endpoint = $"{_api.GetLicensesEndpoint}?discordId={id}";
            var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using HttpResponseMessage response = await _httpClient.SendAsync(request);
            if(response.IsSuccessStatusCode)
            {
                var jsonContent = JsonConvert.DeserializeObject<LicenseResponse>(await response.Content.ReadAsStringAsync());

                if(jsonContent == null)
                {
                    return null;
                }

                return jsonContent.Result;
            }
            Console.WriteLine(response.StatusCode.ToString());
            return null;
        }

        public async Task<bool> ConfirmDiscordLicense(string accessToken, string key, ulong id)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, _api.GetConfirmEndpoint)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                {
                    "code",
                    key
                },
                {
                    "discord_id",
                    id.ToString()
                }
            }),
                Headers = { { "Accept", "application/json" } }
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using HttpResponseMessage response = await _httpClient.SendAsync(request);
            if(response.IsSuccessStatusCode)
            {
                dynamic jsonContent = JsonConvert.DeserializeObject(await response.Content.ReadAsStringAsync());
                return jsonContent.result != null;
            }
            Console.WriteLine(response.Content);
            return false;
        }

        public async Task<bool> ResetHwidAsync(string accessToken, ulong discordId, string License)
        {
            if(string.IsNullOrEmpty(License) || discordId == 0L)
            {
                return false;
            }
            string endpoint = $"{_api.ResetHwidEndpoint}?discordId={discordId}&license={License}";
            var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using HttpResponseMessage response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }


}
