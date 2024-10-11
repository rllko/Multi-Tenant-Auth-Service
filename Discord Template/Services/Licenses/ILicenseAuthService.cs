namespace DiscordTemplate.Services.Licenses
{
    public interface ILicenseAuthService
    {

        Task<string?> CreateKeyAsync(string accessToken, ulong? discordId = null);

        Task<List<string>?> CreateBulkAsync(string accessToken, int amount);

        Task<List<string>?> GetUserLicenses(string accessToken, ulong id);

        Task<bool> ResetHwidAsync(string accessToken, ulong discordId, string License);

        Task<bool> ConfirmDiscordLicense(string accessToken, string key, ulong id);
    }
}
