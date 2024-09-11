using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;
using HeadHunter.Services.CodeService;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Services.Users
{
    public class UserManagerService : IUserManagerService
    {
        private readonly HeadhunterDbContext dbContext;
        private readonly ICodeStorageService codeStoreService;
        private readonly ILogger<UserManagerService> _logger;

        public UserManagerService(HeadhunterDbContext dbContext,
            ICodeStorageService codeStoreService,
            ILogger<UserManagerService> logger)
        {
            this.dbContext = dbContext;
            this.codeStoreService = codeStoreService;
            _logger = logger;
        }

        public async Task<User?> GetUserByIdAsync(long userId)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.Id == userId);
            return user;
        }

        public async Task<User?> GetUserByEmailAsync(string userEmail)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.Email == userEmail);
            return user;
        }

        public async Task<User?> GetUserByLicenseAsync(string license)
        {
            var user = await dbContext.Users.Include(x => x.DiscordUserNavigation).FirstOrDefaultAsync(user => user.License == license);
            return user;
        }

        public async Task<User?> ConfirmUserRegistrationAsync(string license, long discord, string hwid, string? email = null)
        {
            if(string.IsNullOrEmpty(license) || string.IsNullOrEmpty(hwid))
            {
                return null;
            }

            if(discord <= 0)
            {
                return null;
            }

            var user = await dbContext.Users.Include(x => x.DiscordUserNavigation).FirstOrDefaultAsync(user => user.License == license);

            if(user == null)
            {
                return null;
            }

            user.Hwid = hwid;
            var discordUser = await dbContext.DiscordUsers.AddAsync(new DiscordUser { DiscordId = discord, DateLinked = DateTime.Now });
            user.DiscordUser = discordUser.Entity.DiscordId;

            if(email != null)
            {
                user.Email = email;
            }

            await dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetUserByDiscordAsync(long discordId)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.DiscordUser == discordId);
            if(user != null)
            {
                return user;
            }

            return null;
        }

        public Task<User> AuthenticateUserAsync(LoginRequest request)
        {
            throw new NotImplementedException();
        }

        public async Task<User> CreateUserAsync()
        {
            var user = new User
            {
                License = Guid.NewGuid().ToString(),
            };

            var createUserResult = await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync();

            return user;
        }
    }
}
