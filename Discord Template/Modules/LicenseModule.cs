using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Data_Fetch;
using DiscordTemplate.Services.Licenses;

namespace DiscordTemplate.Modules;



[CommandContextType(InteractionContextType.PrivateChannel)]
[RequireOwner]
public class LicenseModule(IOAuthClient authClient, ILicenseAuthService licenseService, IFetchingService fetchingService) : InteractionModuleBase<SocketInteractionContext>
{
    private readonly IOAuthClient _authClient = authClient;
    private readonly ILicenseAuthService _licenseService = licenseService;
    private readonly IFetchingService _fetchingService = fetchingService;



    [SlashCommand("redeem-code", "redeem code given by the launcher")]
    public async Task HandleRedeemDiscordCode(string code)
    {
        await DeferAsync(ephemeral: true);

        if(Context.User is not SocketGuildUser user)
        {
            await FollowupAsync("Something went wrong.");
            return;
        }

        if(code.Length != 20)
        {
            await FollowupAsync("Please input a valid license.");
            return;
        }

        var tokenResponse = await _authClient.GetAccessToken();
        if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            await FollowupAsync("Failed to retrieve access token.");
            return;
        }

        var response = await _licenseService.ConfirmDiscordLicense(tokenResponse.AccessToken, code.ToString(), user.Id);

        if(response.Succeed == false)
        {
            await _fetchingService.SendMessageExceptionToChannelAsync(response, Context.User);
            await FollowupAsync("something wrong happened, contact the developer");
            return;
        }

        if(response.Error != null)
        {
            await FollowupAsync(response.Error);
            return;
        }

        var ownerRole = Context.Guild.Roles
            .FirstOrDefault(role => role.Name == "Owner");

        if(ownerRole == null)
        {
            await user.AddRoleAsync(
                await base.Context.Guild.CreateRoleAsync(
                    "Owner", GuildPermissions.None, Color.Green));
            await FollowupAsync("License Redeemed Successfully!");
            return;
        }

        if(!user.Roles.Contains(ownerRole))
        {
            await user.AddRoleAsync(ownerRole);
        }

        await FollowupAsync("License Redeemed Successfully!");
    }
}
