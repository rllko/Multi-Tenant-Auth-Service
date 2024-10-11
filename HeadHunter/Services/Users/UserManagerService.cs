using HeadHunter.Models;
using HeadHunter.Models.Context;
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

        public async Task<User?> GetUserByPersistenceTokenAsync(string token)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.PersistentToken == token);
            return user;
        }

        public async Task<List<User>?> GetUserLicenseListAsync(long discordId)
        {
            var list = await dbContext.Users.Include(x => x.DiscordUserNavigation).Where(user => user.DiscordUser == discordId).ToListAsync();

            if(list.Count == 0)
            {
                return null;
            }

            return list;
        }

        public async Task<User?> GetUserByHwidAsync(string Hwid)
        {
            if(string.IsNullOrEmpty(Hwid))
            {
                return null;
            }

            var user = await dbContext.Users.Include(x => x.DiscordUserNavigation).FirstOrDefaultAsync(user => user.Hwid!.Contains(Hwid));
            return user;
        }

        public async Task<User?> ConfirmUserRegistrationAsync(string license, long discordId, string? email = null)
        {
            if(string.IsNullOrEmpty(license))
            {
                return null;
            }

            if(discordId <= 0)
            {
                return null;
            }

            var newUser = await dbContext.Users.Include(x => x.DiscordUserNavigation).FirstOrDefaultAsync(user => user.License == license);

            if(newUser == null)
            {
                return null;
            }

            if(await GetUserByDiscordAsync(discordId) == null)
            {
                await dbContext.DiscordUsers.AddAsync(new DiscordUser { DiscordId = discordId, DateLinked = DateTime.Now });
            }

            newUser.DiscordUser = discordId;

            await dbContext.SaveChangesAsync();
            return newUser;
        }

        public async Task<User?> ConfirmUserRegistrationAsync(DiscordCode discordCode)
        {
            long user = (long)discordCode.User.DiscordUser!;

            return await ConfirmUserRegistrationAsync(discordCode.User.License, user, discordCode.User.Email);
        }

        public async Task<User?> GetUserByDiscordAsync(long discordId)
        {
            var user = await dbContext.Users.Include(x => x.DiscordUserNavigation).Where(x => x.DiscordUser == discordId).FirstOrDefaultAsync();
            if(user != null)
            {
                return user;
            }

            return null;
        }

        public async Task<bool> AssignLicenseHwidAsync(string license, List<string> hwid)
        {
            var user =  await GetUserByLicenseAsync(license);

            if(user == null)
            {
                return false;
            }

            await UpdateLicensePersistenceTokenAsync(license);
            user.Hwid = hwid;
            await dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateLicensePersistenceTokenAsync(string license)
        {
            var user =  await GetUserByLicenseAsync(license);

            if(user == null)
            {
                return false;
            }

            user.PersistentToken = Guid.NewGuid().ToString();
            user.LastToken = DateTime.Now.ToUniversalTime();
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetLicensePersistenceToken(string license)
        {
            var user =  await GetUserByLicenseAsync(license);

            if(user == null)
            {
                return false;
            }

            user.PersistentToken = null;
            user.LastToken = null;
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetUserHwidAsync(long discordId)
        {
            var user = await GetUserByDiscordAsync(discordId);

            if(user == null)
            {
                return false;
            }

            user.PersistentToken = null;
            user.LastToken = null;
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

            if(discordId != null && GetUserByDiscordAsync((long) discordId) == null)
            {
                await dbContext.DiscordUsers.AddAsync(new DiscordUser { DiscordId = (long) discordId, DateLinked = DateTime.Now });
            }

            var createUserResult = await dbContext.Users.AddAsync(user);
            await dbContext.SaveChangesAsync();

            return user;
        }
    }
}
