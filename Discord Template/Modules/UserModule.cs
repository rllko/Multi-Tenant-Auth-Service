using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;

namespace DiscordTemplate.Modules
{
    [CommandContextType(InteractionContextType.PrivateChannel, InteractionContextType.Guild)]
    [IntegrationType(ApplicationIntegrationType.UserInstall)]
    public class UserModule(IOAuthClient authClient, ILicenseAuthService licenseService) : InteractionModuleBase<SocketInteractionContext>
    {
        private readonly IOAuthClient _authClient = authClient;
        private readonly ILicenseAuthService _licenseService = licenseService;

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

            SocketUser currentUser = Context.User;

            var licenses = await _licenseService.GetUserLicenses(tokenResponse.AccessToken, currentUser.Id);


#warning yep, this too
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

            ulong currentUserId = Context.User.Id;
            var licenseResponse = await _licenseService.GetUserLicenses(tokenResponse.AccessToken, currentUserId);

            var licenses = licenseResponse.Result;

            if(licenses == null)
            {
                await FollowupAsync("You dont own any license");
                return;
            }
            if(licenses.Count == 0)
            {
                await FollowupAsync("Something went wrong");
                return;
            }

            var resetHwidOperation = await _licenseService.ResetHwidAsync(tokenResponse.AccessToken, currentUserId, licenses.First());

            if(licenses.Count == 1)
            {
                await FollowupAsync(
                    resetHwidOperation.Succeed && resetHwidOperation.Error == null
                    ? "HWID reset was a Success!" : resetHwidOperation.Error);
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

            var resetOperation = await _licenseService
                .ResetHwidAsync(accessToken, user.Id, selected[0]);

            await FollowupAsync(resetOperation.Result ? "HWID reset successfully." : resetOperation.Error, null, ephemeral: true);
        }
    }
}
