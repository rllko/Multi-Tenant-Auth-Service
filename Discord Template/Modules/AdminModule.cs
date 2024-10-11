using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;
using DiscordTemplate.Services.Offsets;

namespace DiscordTemplate.Modules
{
    [Group("admin", "admin commands")]
    [RequireRole(1287486909198630912)]
    [CommandContextType(InteractionContextType.Guild)]
    public class AdminModule(IOAuthClient authClient,
        ILicenseAuthService licenseService,
        IOffsetService offsetService) : InteractionModuleBase<SocketInteractionContext>
    {
        private readonly IOAuthClient _authClient = authClient;
        private readonly ILicenseAuthService _licenseService = licenseService;
        private readonly IOffsetService _offsetService = offsetService;

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
            if(keyResponse == null)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }
            if(!(user is SocketGuildUser socketUser))
            {
                user = base.Context.User;
                await user.CreateDMChannelAsync().Result.SendMessageAsync("Key created successfully:```" + keyResponse + "```");
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
            await socketUser.CreateDMChannelAsync().Result.SendMessageAsync("Key created successfully:```" + keyResponse + "```");
            await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
        }

        [SlashCommand("generate-bulk-keys", "generates a key", false, RunMode.Default)]
        [RequireRole(1287486909198630912uL)]
        public async Task HandleBulkCreate([Summary(null, "person to send the keys to")] IUser user, int amount)
        {
            await DeferAsync(ephemeral: true);
            TokenResponse tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }
            var keyResponse = await _licenseService.CreateBulkAsync(tokenResponse.AccessToken, amount + 1);
            if(keyResponse == null)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }
            if(!(user is SocketGuildUser socketUser))
            {
                await FollowupAsync("Failed to create key.");
                return;
            }
            await user.CreateDMChannelAsync().Result.SendMessageAsync("Keys created successfully:```" + string.Join("\n", keyResponse.Select((string license) => license ?? "")) + "\nThanks for Joining us!```");
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
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
            }
            else if(!(await _offsetService.SetOffsets(tokenResponse.AccessToken, attachment.Url, filename ?? attachment.Filename)))
            {
                await FollowupAsync("Failed to set offsets.");
            }
            else
            {
                await FollowupAsync("Success!", null, isTTS: false, ephemeral: true);
            }
        }

        [SlashCommand("get-offsets", "see offsets", false, RunMode.Default)]
        [RequireRole(1287486909198630912uL)]
        public async Task ObtainOffsets(string filename)
        {
            await DeferAsync(ephemeral: true);
            Embed eb = new EmbedBuilder().WithTitle("Files").WithDescription("All Files are readonly, only meant to be downloaded").AddField("Metadata:", "Yo")
            .WithUrl("https://" + filename)
            .WithColor(Color.Blue)
            .WithFooter("Requested by: " + base.Context.User.Mention)
            .WithTimestamp(DateTimeOffset.Now)
            .Build();
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }
            var keyResponse = await _offsetService.GetOffsets(tokenResponse.AccessToken, filename);
            if(keyResponse == null)
            {
                await FollowupAsync("Failed to get offsets.");
                return;
            }
            FileAttachment e = new FileAttachment(keyResponse, filename ?? "");
            await base.Context.Channel.SendFileAsync(e, "File requested by " + base.Context.User.Mention);
            await FollowupAsync("Success!", null, isTTS: false, ephemeral: true, null, null, null, eb);
        }
    }
}
