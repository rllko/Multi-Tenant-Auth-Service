using DiscordTemplate.OAuth;
using Newtonsoft.Json;

namespace DiscordTemplate.Services.Offsets
{
    public class OffsetsResponse<T> : IProtectedEndpoint
    {
        public string? Error { get; set; }

        public T? Result { get; set; }

        public static OffsetsResponse<T> Parse(string licenseJson)
        {
            var response = JsonConvert.DeserializeObject<OffsetsResponse<T>>(licenseJson);

            if(response is not null)
            {
                return response;
            }
        
            return new OffsetsResponse<T>()
            {
                ExceptionMessage = "Unexpected Error",
                StackTrace = licenseJson,
            };
        }
    }
}
