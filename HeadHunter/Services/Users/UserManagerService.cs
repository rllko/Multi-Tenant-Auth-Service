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
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.License == license);
            return user;
        }

        public async Task<User?> GetUserByDiscordAsync(long discordId)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(user => user.Discord == discordId);
            return user;
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


        //public async Task<OpenIdConnectLoginResponse> LoginUserByOpenIdAsync(OpenIdConnectLoginRequest request)
        //{
        //    bool validationResult = validateOpenIdLoginRequest(request);
        //    if(!validationResult)
        //    {
        //        _logger.LogInformation("login process is failed for request: {request}", request);
        //        return new OpenIdConnectLoginResponse { Error = "The login process is failed" };
        //    }

        //    AppUser user = null;

        //    user = await _userManager.FindByNameAsync(request.UserName);
        //    if(user == null && request.UserName.Contains("@"))
        //        user = await _userManager.FindByEmailAsync(request.UserName);

        //    if(user == null)
        //    {
        //        _logger.LogInformation("creditioanl {userName}", request.UserName);
        //        return new OpenIdConnectLoginResponse { Error = "No user has this creditioanl" };
        //    }

        //    await _signInManager.SignOutAsync();


        //    Microsoft.AspNetCore.Identity.SignInResult loginResult = await _signInManager
        //        .PasswordSignInAsync(user, request.Password, false, false);

        //    if(loginResult.Succeeded)
        //    {
        //        return new OpenIdConnectLoginResponse { Succeeded = true, AppUser = user };
        //    }

        //    return new OpenIdConnectLoginResponse { Succeeded = false, Error = "Login is not Succeeded" };
        //}

        //#region Helper Functions
        //private bool validateLoginRequest(LoginRequest request)
        //{
        //    if(request.UserName == null || request.Password == null)
        //        return false;

        //    if(request.Password.Length < 8)
        //        return false;

        //    return true;
        //}

        //private bool validateOpenIdLoginRequest(OpenIdConnectLoginRequest request)
        //{
        //    if(request.Code == null || request.UserName == null || request.Password == null)
        //        return false;
        //    return true;
        //}

        //private bool validateCreateUserRequest(CreateUserRequest request)
        //{
        //    if(request.UserName == null || request.Password == null || request.Email == null)
        //        return false;
        //    return true;
        //}

        //#endregion
    }
}
