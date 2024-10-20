namespace DiscordTemplate.Services.Licenses
{
    public interface ILicenseAuthService
    {
        Task<LicenseResponse<string>> CreateKeyAsync(string accessToken, ulong? discordId = null);

        Task<LicenseResponse<List<string>>> CreateBulkAsync(string accessToken, int amount);

        Task<LicenseResponse<List<string>?>> GetUserLicenses(string accessToken, ulong id);

        Task<LicenseResponse<string>> ResetHwidAsync(string accessToken, ulong discordId, string License);

        Task<LicenseResponse<bool>> ConfirmDiscordLicense(string accessToken, string key, ulong id);
    }


}
