namespace DiscordTemplate.Services.Licenses
{
    public interface ILicenseAuthService
    {
        Task<string?> CreateKeyAsync(string accessToken, ulong? discordId = null);
        Task<List<string>> GetUserLicenses(string accessToken, ulong id);
        Task<bool> ResetHwidAsync(string accessToken, ulong discordId, string License);
    }
}
