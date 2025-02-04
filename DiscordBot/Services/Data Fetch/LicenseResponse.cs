using DiscordTemplate.OAuth;
using Newtonsoft.Json;

namespace DiscordTemplate.Services.Data_Fetch
{
    public class DataFetchingResponse<T> : IProtectedEndpoint
    {
        public string? Error { get; set; }
        public T? Result { get; set; }

        public static DataFetchingResponse<T> Parse(string licenseJson)
        {
            var response = JsonConvert.DeserializeObject<DataFetchingResponse<T>>(licenseJson);

            if(response is not null)
            {
                return response;
            }

            return new DataFetchingResponse<T>()
            {
                ExceptionMessage = "Unexpected Error",
                StackTrace = licenseJson,
            };
        }
    }
}
