using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

namespace DiscordTemplate.Services.Offsets
{
    internal class OffsetService : IOffsetService
    {
        private readonly HttpClient _httpClient;
        private readonly ApiConfiguration? _api;

        public OffsetService(HttpClient httpClient, IConfigurationRoot configurationRoot)
        {
            _api = configurationRoot.GetSection("ApiConfiguration").Get<ApiConfiguration>();
            _httpClient = httpClient;

            if(_api is null)
            {
                throw new Exception("Api Configuration is missing in the configuration file.");
            }
        }

        public async Task<Stream?> GetOffsets(string accessToken, string filename)
        {
            var endpoint = $"{_api!.PublicOffsetsEndpoint }?file={filename}";

            var request = new HttpRequestMessage(HttpMethod.Get,endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if(response.IsSuccessStatusCode)
            {
                var content = response.Content;
                return await content.ReadAsStreamAsync();
            }

            // Debug, please improve this later
            Console.WriteLine(response.StatusCode.ToString());
            return null;
        }

        public async Task<bool> SetOffsets(string accessToken, string offsetsUrl, string filename)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, _api!.OffsetsEndpoint)
            {
                Content =
                    new FormUrlEncodedContent(
                    new Dictionary<string, string>
                    {
                        {"url", offsetsUrl },
                        {"filename", filename }
                    }),
                Headers =

                    {
                        { "Accept", "application/json"},
                    },
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var response = await _httpClient.SendAsync(request);

            if(response.IsSuccessStatusCode)
            {
                return true;
            }

            // Debug, please improve this later
            Console.WriteLine(response.StatusCode.ToString());
            return false;

        }

        class LicenseResponse
        {
            public string? Error { get; set; } = null;
            public List<string>? Result { get; set; } = null;
        }
    }
}
