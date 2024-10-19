using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Data_Fetch;
using DiscordTemplate.Services.Licenses;
using DiscordTemplate.Services.Offsets;

namespace DiscordTemplate.Modules
{
    [Group("admin", "admin commands")]
    [RequireRole(1287486909198630912)]
    [RequireContextPermission(ChannelPermission.ManageChannels)]
    public class AdminModule(IOAuthClient authClient,
        ILicenseAuthService licenseService,
        IOffsetService offsetService, IFetchingService fetchingService) : InteractionModuleBase<SocketInteractionContext>
    {
        private readonly IOAuthClient _authClient = authClient;
        private readonly ILicenseAuthService _licenseService = licenseService;
        private readonly IOffsetService _offsetService = offsetService;
        private readonly IFetchingService _fetchingService = fetchingService;

        [SlashCommand("generate-key", "generates a key", false, RunMode.Default)]
        public async Task HandleCreate([Summary(null, "Leave null if none")] IUser? user = null)
        {
            await DeferAsync(ephemeral: true);
            var tokenResponse = await _authClient.GetAccessToken();

            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            var keyResponse = await _licenseService.CreateKeyAsync(tokenResponse.AccessToken, user?.Id);

            if(keyResponse.Succeed is false)
            {
                await _fetchingService.SendMessageExceptionToChannelAsync(keyResponse, Context.User);
                await FollowupAsync("Something wrong happened, Please try again later.");
            }

            if(keyResponse.Result == null)
            {
                await FollowupAsync(keyResponse.Error);
                return;
            }

            if(user is not SocketGuildUser socketUser)
            {
                user = base.Context.User;
                await user.CreateDMChannelAsync().Result.SendMessageAsync("Key created successfully:```" + keyResponse.Result + "```");
                await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
                return;
            }
            var ownerRole = base.Context.Guild.Roles.FirstOrDefault((SocketRole x) => x.Name == "Owner");
            if(ownerRole == null && user != null)
            {
                await socketUser.AddRoleAsync(await base.Context.Guild.CreateRoleAsync("Owner", GuildPermissions.None, Color.Green, isHoisted: false, isMentionable: true));
                await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
                return;
            }
            if(socketUser.Guild.Roles.FirstOrDefault((SocketRole x) => x.Id == 1287195740996763721L) == null)
            {
                await socketUser.AddRoleAsync(ownerRole);
            }
            await socketUser.CreateDMChannelAsync().Result.SendMessageAsync("Key created successfully:```" + keyResponse.Result + "```");
            await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
        }

        [SlashCommand("generate-bulk-keys", "generates a key", false, RunMode.Default)]
        [RequireRole(1287486909198630912uL)]
        public async Task HandleBulkCreate([Summary(null, "person to send the keys to")] IUser user, int amount)
        {
            await DeferAsync(ephemeral: true);
            var tokenResponse = await _authClient.GetAccessToken();

            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            var keyResponse = await _licenseService.CreateBulkAsync(tokenResponse.AccessToken, amount + 1);
            if(keyResponse.Result == null)
            {

                await FollowupAsync("Failed to create key.");
                return;
            }
            if(user is not SocketGuildUser socketUser)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }

            await user.CreateDMChannelAsync().Result
                .SendMessageAsync("Keys created successfully:```" + string.Join("\n"
                , keyResponse.Result.Select((string license) => license ?? "")) + "\nThanks for Joining us!```");
            var ownerRole = base.Context.Guild.Roles.FirstOrDefault((SocketRole x) => x.Name == "Reseller");
            if(ownerRole == null && user != null)
            {
                await socketUser.AddRoleAsync(await base.Context.Guild.CreateRoleAsync("Reseller", GuildPermissions.None, Color.DarkGreen, isHoisted: false, isMentionable: true));
                await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
                return;
            }
            if(!socketUser.Roles.Contains(ownerRole))
            {
                await socketUser.AddRoleAsync(ownerRole);
            }
            await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
        }

        [SlashCommand("setup-offsets", "setup", false, RunMode.Default)]
        [RequireRole(1287486909198630912uL)]
        public async Task HandleOffsets(IAttachment attachment, string? filename = null)
        {
            await DeferAsync(ephemeral: true);
            var tokenResponse = await _authClient.GetAccessToken();

            if(tokenResponse == null)
            {
                await FollowupAsync("Something really unexpected happened");
            }

            if(tokenResponse!.Succeed == false)
            {
                #warning add more info to the exceptions, this doesnt say much more details
                await _fetchingService.SendMessageExceptionToChannelAsync(tokenResponse, Context.User);
                return;
            }

            if(string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            var setOffsetsOperation = await _offsetService
                .SetOffsets(tokenResponse!.AccessToken!, attachment.Url
                , filename ?? attachment.Filename, Context.User.Id);

            if(setOffsetsOperation.Succeed == false)
            {
                await _fetchingService.SendMessageExceptionToChannelAsync(setOffsetsOperation, Context.User);
                await FollowupAsync("Something wrong happened. Please try again later.");
            }

            if(setOffsetsOperation.Result == false)
            {
                await FollowupAsync(setOffsetsOperation.Error);
                return;
            }

            await FollowupAsync("Success!", ephemeral: true);
        }

        [SlashCommand("get-offsets", "see offsets", false, RunMode.Default)]
        [RequireRole(1287486909198630912uL)]
        public async Task ObtainOffsets(string filename)
        {
            await DeferAsync(ephemeral: true);

            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            var offsetOperation = await _offsetService.GetOffsets(tokenResponse.AccessToken, filename);

            if(offsetOperation.Succeed is false)
            {
                await FollowupAsync(offsetOperation.Error);
                return;
            }

            var e = new FileAttachment(offsetOperation.Result, filename ?? "");

            try
            {
                await base.Context.Channel.SendFileAsync(e, "File requested by " + base.Context.User.Mention);
                await FollowupAsync("Success!", ephemeral: true);
            }
            catch(Exception)
            {
                await FollowupAsync("bruh?");
            }
        }
    }
}
