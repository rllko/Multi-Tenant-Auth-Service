using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;

namespace DiscordTemplate.Modules
{
    [CommandContextType(InteractionContextType.PrivateChannel, InteractionContextType.Guild, InteractionContextType.BotDm)]
    [IntegrationType(ApplicationIntegrationType.UserInstall)]
    public class UserModule : InteractionModuleBase<SocketInteractionContext>
    {
        private readonly IOAuthClient _authClient;
        private readonly ILicenseAuthService _licenseService;

        public UserModule(IOAuthClient authClient, ILicenseAuthService licenseService)
        {
            _authClient = authClient;
            _licenseService = licenseService;
        }

        [SlashCommand("airfryer", "He doesnt own one, imagine!", false, RunMode.Default)]
        public async Task DoesntOwnAirFryer(IUser user)
        {
            await RespondAsync(user.Mention + " clearly doesnt own an Air Fryer, laugh at him!");
        }

        [SlashCommand("license-list", "Shows a list with your owned licenses", false, RunMode.Default)]
        public async Task DisplayUserLicenses()
        {
            await DeferAsync(ephemeral: true);
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Something wrong happened.");
                return;
            }
            SocketUser currentUser = base.Context.User;
            var licenses = await _licenseService.GetUserLicenses(tokenResponse.AccessToken, currentUser.Id);
            if(licenses == null)
            {
                await FollowupAsync("You dont own any license");
                return;
            }
            await FollowupAsync($"```\r\n************************************\r\n* Licenses Owned by {currentUser.GlobalName}\r\n************************************\r\n\r\n{string.Join("\n", licenses.Select((string license) => license + "\nAcquired at: Date Here"))}\r\n\r\nKeep track of your licenses!\r\nThank you for trusting in our mission!\r\n\r\n************************************\r\n```");
        }

        [SlashCommand("reset-hwid", "reset's license hwid", false, RunMode.Default)]
        public async Task ResetHwidHandler()
        {
            await DeferAsync(ephemeral: true);
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Something wrong happened.");
                return;
            }
            ulong currentUserId = base.Context.User.Id;
            var licenses = await _licenseService.GetUserLicenses(tokenResponse.AccessToken, currentUserId);
            if(licenses == null)
            {
                await FollowupAsync("You dont own any license");
                return;
            }
            if(!licenses.Any())
            {
                await FollowupAsync("Something went wrong");
                return;
            }
            if(licenses.Count == 1)
            {
                await FollowupAsync((await _licenseService.ResetHwidAsync(tokenResponse.AccessToken, currentUserId, licenses.First())) ? "HWID reset was a Success!" : "This License Doesnt need a reset.");
                return;
            }
            SelectMenuBuilder selectMenu = new SelectMenuBuilder().WithPlaceholder("Select a License to reset").WithCustomId("license_selection:" + tokenResponse.AccessToken);
            licenses.ForEach(delegate (string license)
            {
                selectMenu.AddOption(new SelectMenuOptionBuilder(license, license));
            });
            ComponentBuilder component = new ComponentBuilder().WithSelectMenu(selectMenu);
            await FollowupAsync("Please select a License", null, isTTS: false, ephemeral: true, null, null, component.Build());
        }

        [ComponentInteraction("license_selection:*", false, RunMode.Default)]
        public async Task HandleRace(string accessToken, string [] selected)
        {
            await DeferAsync();
            var user = Context.Interaction.User;

            if(user == null)
            {
                await FollowupAsync("Something went wrong.", ephemeral: true);
                return;
            }

            await FollowupAsync((await _licenseService.ResetHwidAsync(accessToken, user.Id, selected [0])) ? "HWID reset successfully." : "This License Doesnt need a reset.", null, isTTS: false, ephemeral: true);
        }

        [SlashCommand("redeem-code", "redeem code given by the launcher")]
        public async Task HandleRedeemDiscordCode(string code)
        {
            await DeferAsync(ephemeral: true);
            if(Context.User is not SocketGuildUser user)
            {
                await FollowupAsync("Something went wrong.");
                return;
            }
            var tokenResponse = await _authClient.GetAccessToken();
            if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                await FollowupAsync("Failed to retrieve access token.");
                return;
            }
            if(code.Length != 20)
            {
                await FollowupAsync("Please input a valid license.");
                return;
            }
            if(!(await _licenseService.ConfirmDiscordLicense(tokenResponse.AccessToken, code.ToString(), user.Id)))
            {
                await FollowupAsync("Invalid Code.");
                return;
            }
            var ownerRole = base.Context.Guild.Roles.FirstOrDefault((SocketRole x) => x.Name == "Owner");
            if(ownerRole == null)
            {
                await user.AddRoleAsync(await base.Context.Guild.CreateRoleAsync("Owner", GuildPermissions.None, Color.Green, isHoisted: false, isMentionable: true));
                await FollowupAsync("License Redeemed Successfully!");
                return;
            }
            //if(!user.Roles.Contains(ownerRole))
            //{
            //    await user.AddRoleAsync(ownerRole);
            //}
            await FollowupAsync("License Redeemed Successfully!");
        }
    }
}
