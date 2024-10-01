using HeadHunter.Models;
using HeadHunter.Models.Entities;

namespace HeadHunter.Services.Users
{
    public interface IUserManagerService
    {
        Task<User?> GetUserByIdAsync(long userId);
        Task<User?> GetUserByEmailAsync(string userEmail);
        Task<User?> GetUserByLicenseAsync(string license);
        Task<User?> GetUserByDiscordAsync(long discordId);
        Task<User?> GetUserByHwidAsync(string Hwid);
        Task<List<User>?> GetUserLicenseListAsync(long discordId);
        Task<bool> AssignLicenseHwidAsync(string License, List<string> hwid);
        Task<bool> UpdateUserHwidAsync(long discordId, List<string> hwid);
        Task<bool> ResetUserHwidAsync(long discordId);
        Task<User> CreateUserAsync(long? discordId = null);
        Task<List<User>> CreateUserInBulk(int amount);
        Task<User?> ConfirmUserRegistrationAsync(string license, long discord, List<string> hwid, string? email = null);
        Task<User?> ConfirmUserRegistrationAsync(DiscordCode discordCode);

    }
}
