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
            var response = new OffsetsResponse<Stream>();
            
            if(string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(filename))
            {
                response.ExceptionMessage = "Invalid Parameters";
                return response;
            }

            var endpoint = $"{_api!.OffsetsEndpoint }/{filename}";

            var request = new HttpRequestMessage(HttpMethod.Get,endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            
            var httpResponseMessage = await _httpClient.SendAsync(request);
            var requestResponseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            
            var temp = OffsetsResponse<string>.Parse(requestResponseJson);

            if (temp.Succeed is false || temp.Error is not "none")
            {
                response.Error = temp.Error;
                response.ExceptionMessage = temp.ExceptionMessage;
                response.StackTrace = temp.StackTrace;
                return response;
            }

            var responseStream = Convert.FromBase64String(temp.Result!);
            response.Result =  new MemoryStream(responseStream);
            
            return response;
        }

        public async Task<OffsetsResponse<bool>> SetOffsets(string accessToken, string offsetsUrl, string filename, ulong discordId)
        {
            var offsets = new OffsetsResponse<bool>();

            if(string.IsNullOrEmpty(offsetsUrl) ||
                 string.IsNullOrEmpty(filename) ||
                 string.IsNullOrEmpty(accessToken))
            {
                offsets.Error = "Invalid url or filename!";
                offsets.Result = false;
                return offsets;
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, _api!.OffsetsEndpoint);
            request.Content = new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    {"url", offsetsUrl },
                    {"filename", filename },
                    {"discordId",discordId.ToString()}
                });
            request.Headers.Add("Accept", "application/json");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var httpResponseMessage = await _httpClient.SendAsync(request);

            var requestResponseJson = await httpResponseMessage.Content.ReadAsStringAsync();
            offsets = OffsetsResponse<bool>.Parse(requestResponseJson);
            return offsets;
        }
    }
}
