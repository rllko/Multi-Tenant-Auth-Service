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
        Task<User?> GetUserByHwidAsync(long Hwid);
        Task<User?> GetUserByPersistanceTokenAsync(string token);
        Task<List<User>?> GetUserLicenseListAsync(long discordId);
        Task<int> GetUserHwidResetCount(string license);
        Task<bool> AssignLicenseHwidAsync(string License, Hwid hwid);
        Task<bool> UpdateLicensePersistenceTokenAsync(string license);
        Task<bool> ResetLicensePersistenceToken(string license);
        Task<bool> ResetUserHwidAsync(long discordId);
        Task<User> CreateUserAsync(long? discordId = null);

        Task<List<User>> CreateUserInBulk(int amount);
        Task<User?> ConfirmUserRegistrationAsync(string license, long discord, string? email = null);
        Task<User?> ConfirmUserRegistrationAsync(DiscordCode discordCode);

    }
}
