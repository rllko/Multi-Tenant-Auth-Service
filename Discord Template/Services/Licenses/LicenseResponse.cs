using DiscordTemplate.OAuth;
using Newtonsoft.Json;

namespace DiscordTemplate.Services.Licenses
{
    public class LicenseResponse<T> : IProtectedEndpoint
    {
        public string? Error { get; set; }
        public T? Result { get; set; }

        public static LicenseResponse<T> Parse(string licenseJson)
        {
            var response = JsonConvert.DeserializeObject<LicenseResponse<T>>(licenseJson);

            if(response is not null)
            {
                return response;
            }

            return new LicenseResponse<T>()
            {
                ExceptionMessage = "Unexpected Error",
                StackTrace = licenseJson,
            };
        }
    }
}
