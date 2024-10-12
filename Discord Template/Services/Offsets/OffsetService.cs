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

        public async Task<OffsetsResponse<Stream>> GetOffsets(string accessToken, string filename)
        {
            var offsets = new OffsetsResponse<Stream>();

            if(string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(filename))
            {
                offsets.ExceptionMessage = "Invalid filename";
                return offsets;
            }

            var endpoint = $"{_api!.PublicOffsetsEndpoint }?file={filename}";

            var request = new HttpRequestMessage(HttpMethod.Get,endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var httpResponseMessage = await _httpClient.SendAsync(request);

            offsets = OffsetsResponse<Stream>.Parse(await httpResponseMessage.Content.ReadAsStringAsync());
            return offsets;
        }

        public async Task<OffsetsResponse<bool>> SetOffsets(string accessToken, string offsetsUrl, string filename)
        {
            var offsets = new OffsetsResponse<bool>();

            if(string.IsNullOrEmpty(offsetsUrl) || string.IsNullOrEmpty(filename) || string.IsNullOrEmpty(accessToken))
            {
                offsets.Error = "Invalid url or filename!";
                return offsets;
            }

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
            using var httpResponseMessage = await _httpClient.SendAsync(request);

            offsets = OffsetsResponse<bool>.Parse(await httpResponseMessage.Content.ReadAsStringAsync());
            return offsets;
        }

        class LicenseResponse
        {
            public string? Error { get; set; } = null;
            public List<string>? Result { get; set; } = null;
        }
    }
}
