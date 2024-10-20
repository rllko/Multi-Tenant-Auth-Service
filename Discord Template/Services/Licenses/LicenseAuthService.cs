using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

namespace DiscordTemplate.Services.Licenses
{
    internal class LicenseAuthService : ILicenseAuthService
    {
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


        public async Task<LicenseResponse<string>> CreateKeyAsync(string accessToken, ulong? discordId = null)
        {
            var result = new LicenseResponse<string>();

            if(string.IsNullOrEmpty(accessToken))
            {
                result.ExceptionMessage = "Invalid Access Token, Try again!";
            }

            string endpoint = _api!.CreateLicenseEndpoint + (discordId.HasValue ? $"?discordId={discordId}" : "");

            using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using HttpResponseMessage httpResponseMessage = await _httpClient.SendAsync(request);
            var responseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            result = LicenseResponse<string>.Parse(responseJson);
            return result;
        }


        public async Task<LicenseResponse<List<string>>> CreateBulkAsync(string accessToken, int amount)
        {
            string endpoint = $"{_api!.CreateBulkLicenseEndpoint}?amount={amount}";

            using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var httpResponseMessage = await _httpClient.SendAsync(request);

            var response = LicenseResponse<List<string>>.Parse(await httpResponseMessage.Content.ReadAsStringAsync());
            return response;
        }


        public async Task<LicenseResponse<List<string>?>> GetUserLicenses(string accessToken, ulong discordId)
        {
            var licenses = new LicenseResponse<List<string>>();

            if(discordId <= 0L || string.IsNullOrEmpty(accessToken))
            {
                licenses.Error = "Invalid discordId or Token";
                return licenses;
            }

            string endpoint = $"{_api!.GetLicensesEndpoint}/{discordId}";

            var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var httpResponseMessage = await _httpClient.SendAsync(request);

            licenses = LicenseResponse<List<string>?>.Parse(await httpResponseMessage.Content.ReadAsStringAsync());
            return licenses;
        }


        public async Task<LicenseResponse<bool>> ConfirmDiscordLicense(string accessToken, string key, ulong discordId)
        {
            var license = new LicenseResponse<bool>();

            if(string.IsNullOrEmpty(key) || discordId == 0L || string.IsNullOrEmpty(accessToken))
            {
                license.Error = "Invalid discordId or Token";
                return license;
            }

            var request = new HttpRequestMessage(HttpMethod.Post, _api!.GetConfirmEndpoint)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                {
                    "code",
                    key
                },
                {
                    "discord_id",
                    discordId.ToString()
                }
            }),
                Headers = { { "Accept", "application/json" } }
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var httpResponseMessage = await _httpClient.SendAsync(request);

            license = LicenseResponse<bool>.Parse(await httpResponseMessage.Content.ReadAsStringAsync());
            return license;

        }


        public async Task<LicenseResponse<string>> ResetHwidAsync(string accessToken, ulong discordId, string License)
        {
            var license = new LicenseResponse<string>();

            if(string.IsNullOrEmpty(License) || discordId == 0L || string.IsNullOrEmpty(accessToken))
            {
                license.Error = "Invalid License or DiscordID";
                return license;
            }

            string endpoint = $"{_api!.ResetHwidEndpoint}/{discordId}/{License}";

            var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var httpResponseMessage = await _httpClient.SendAsync(request);
            var jsonresponse = await httpResponseMessage.Content.ReadAsStringAsync();
            license = LicenseResponse<string>.Parse(jsonresponse);
            return license;
        }
    }


}
