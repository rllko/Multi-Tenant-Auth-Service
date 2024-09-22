using HeadHunter.Context;
using HeadHunter.Models;
using HeadHunter.Models.Entities;
using HeadHunter.Services.CodeService;
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

        public async Task<List<User>?> GetUserLicenseListAsync(long discordId)
        {
            var list = dbContext.Users.Include(x => x.DiscordUserNavigation).Where(user => user.DiscordUser == discordId).ToList();

            if(list.Count == 0)
            {
                return null;
            }

            return list;
        }

        public async Task<User?> GetUserByHwidAsync(string Hwid)
        {
            var user = await dbContext.Users.Include(x => x.DiscordUserNavigation).FirstOrDefaultAsync(user => user.Hwid == Hwid);
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

            user.DiscordUserNavigation?.Users.Add(user);
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

        public async Task<User?> ConfirmUserRegistrationAsync(DiscordCode discordCode)
        {
            long user = (long)discordCode.User.DiscordUser!;

            return await ConfirmUserRegistrationAsync(discordCode.User.License, user, discordCode.User.Hwid!, discordCode.User.Email);
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

        public async Task<bool> AssignLicenseHwidAsync(string License, string hwid)
        {
            var user =  await dbContext.Users.FirstOrDefaultAsync( x => x.License == License);

            if(user == null)
            {
                return false;
            }

            user.Hwid = hwid;
            await dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateUserHwidAsync(long discordId, string hwid)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(x => x.DiscordUser == discordId);

            if(user == null)
            {
                return false;
            }

            user.Hwid = hwid;
            await dbContext.SaveChangesAsync();

            return true;
        }
        public async Task<bool> ResetUserHwidAsync(long discordId)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(x => x.DiscordUser == discordId);

            if(user == null)
            {
                return false;
            }

            user.Hwid = null;
            await dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<List<User>> CreateUserInBulk(int amount)
        {
            var users = new List<User>();

            if(amount <= 0)
            {
                return users;
            }

            for(int i = 0; i < amount; i++)
            {
                users.Add(await CreateUserAsync());
            }

            return users;
        }
        // Need to create the bulk creation of users

        public async Task<User> CreateUserAsync(long? discordId = null)
        {
            var user = new User
            {
                License = Guid.NewGuid().ToString(),
                DiscordUser = discordId ?? null,
            };

            if(discordId != null && dbContext.DiscordUsers.FirstOrDefault(x => x.DiscordId == discordId) == null)
            {
                await dbContext.DiscordUsers.AddAsync(new DiscordUser { DiscordId = (long) discordId, DateLinked = DateTime.Now });
            }

            var createUserResult = await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync();

            return user;
        }
    }
}
