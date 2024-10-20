using DiscordTemplate.OAuth;
using Newtonsoft.Json;

namespace DiscordTemplate.Services.Licenses
{
    public class LicenseResponse<T> : IProtectedEndpoint
    {
        public T? Result { get; set; }
        public string Error { get; set; } = "none";

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
