using HeadHunter.Models;
using HeadHunter.Models.Entities;
using Microsoft.AspNetCore.Identity.Data;

namespace HeadHunter.Services.Users
{
    public interface IUserManagerService
    {
        Task<User?> GetUserByIdAsync(long userId);
        Task<User?> GetUserByEmailAsync(string userEmail);
        Task<User?> GetUserByLicenseAsync(string license);
        Task<User?> GetUserByDiscordAsync(long discordId);
        Task<User> AuthenticateUserAsync(LoginRequest request);
        Task<User> CreateUserAsync(long? discordId = null);
        Task<User?> ConfirmUserRegistrationAsync(string license, long discord, string hwid, string? email = null);
        Task<User?> ConfirmUserRegistrationAsync(DiscordCode discordCode);

    }
}
