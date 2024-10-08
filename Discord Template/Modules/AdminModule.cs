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

        [SlashCommand("generate-key", "generates a key")]
        public async Task HandleCreate([Summary(description: "Leave null if none")] IUser? user = null)
        {
            // Acknowledge the command so Discord doesn't time out while processing
            await DeferAsync(ephemeral: true);

            // Get the access token
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            // Delegate the API request to the service
            var keyResponse = await _licenseService.CreateKeyAsync(tokenResponse.AccessToken,user?.Id);
            if(keyResponse == null)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }

            if(user is not SocketGuildUser socketUser)
            {
                user = Context.User;
                await user.CreateDMChannelAsync().Result.SendMessageAsync($"Key created successfully:```{keyResponse}```");
                await FollowupAsync(ephemeral: true, text: "Success!");
                return;
            }

            var ownerRole = Context.Guild.Roles.FirstOrDefault(x => x.Name == "Owner");

            if(ownerRole == null && user != null)
            {
                var newRole = await Context.Guild.CreateRoleAsync(
                "Owner", GuildPermissions.None, Color.Green, false, true);
                await socketUser.AddRoleAsync(newRole);
                await FollowupAsync(ephemeral: true, text: "Success!");
                return;

            }
            if(socketUser.Guild.Roles.FirstOrDefault(x => x.Id == 1287195740996763721) == null)
            {
                await socketUser.AddRoleAsync(ownerRole);
            }

            await socketUser.CreateDMChannelAsync().Result.SendMessageAsync($"Key created successfully:```{keyResponse}```");
            await FollowupAsync(ephemeral: true, text: "Success!");
        }


        [SlashCommand("generate-bulk-keys", "generates a key")]
        [RequireRole(1287486909198630912)]
        public async Task HandleBulkCreate([Summary(description: "person to send the keys to")] IUser user, int amount)
        {
            // Acknowledge the command so Discord doesn't time out while processing
            await DeferAsync(ephemeral: true);

            // Get the access token
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            // Delegate the API request to the service
            var keyResponse = await _licenseService.CreateBulkAsync(tokenResponse.AccessToken,amount+1);
            if(keyResponse == null)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }

            if(user is not SocketGuildUser socketUser)
            {
                await FollowupAsync("Failed to create key.");
                return;
            }

            await user.CreateDMChannelAsync().Result.SendMessageAsync(
                $"Keys created successfully:```{String.Join("\n", keyResponse.Select(license => $"{license}"))}\nThanks for Joining us!```");

            var ownerRole = Context.Guild.Roles.FirstOrDefault(x => x.Name == "Reseller");

            if(ownerRole == null && user != null)
            {
                var newRole = await Context.Guild.CreateRoleAsync(
                "Reseller", GuildPermissions.None, Color.DarkGreen, false, true);
                await socketUser!.AddRoleAsync(newRole);
                await FollowupAsync(ephemeral: true, text: "Success!");
                return;

            }

            if(socketUser.Roles.Contains(ownerRole) == false)
            {
                await socketUser.AddRoleAsync(ownerRole);
            }

            await FollowupAsync(ephemeral: true, text: "Success!");
        }

        [SlashCommand("setup-offsets", "setup")]
        [RequireRole(1287486909198630912)]
        public async Task HandleOffsets(IAttachment attachment, string? filename = null)
        {
            // Acknowledge the command so Discord doesn't time out while processing
            await DeferAsync(ephemeral: true);

            // Get the access token
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            // Delegate the API request to the service
            var keyResponse = await _offsetService.SetOffsets(tokenResponse.AccessToken,attachment.Url,filename ?? attachment.Filename);
            if(keyResponse == false)
            {
                await FollowupAsync("Failed to set offsets.");
                return;
            }

            await FollowupAsync(ephemeral: true, text: "Success!");
        }

        [SlashCommand("get-offsets", "see offsets")]
        [RequireRole(1287486909198630912)]
        public async Task ObtainOffsets(string filename)
        {
            // Acknowledge the command so Discord doesn't time out while processing
            await DeferAsync(ephemeral: true);

            var eb  = new EmbedBuilder().WithTitle("Files").WithDescription("All Files are readonly, only meant to be downloaded").AddField("Metadata:","Yo")
                .WithUrl($"https://{filename}").WithColor(Color.Blue).WithFooter("Requested by: "+Context.User.Mention).WithTimestamp(DateTimeOffset.Now).Build();

            // Get the access token
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }

            // Delegate the API request to the service
            var keyResponse = await _offsetService.GetOffsets(tokenResponse.AccessToken,filename);

            if(keyResponse == null)
            {
                await FollowupAsync("Failed to get offsets.");
                return;
            }

            FileAttachment e = new(keyResponse,$"{filename}");

            await Context.Channel.SendFileAsync(e, $"File requested by {Context.User.Mention}");

            await FollowupAsync(ephemeral: true, text: "Success!", embed: eb);
        }

    }
}
