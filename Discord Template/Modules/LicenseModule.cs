using Discord.Interactions;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;

namespace DiscordTemplate.Modules;

public class LicenseModule(IOAuthClient authClient, ILicenseAuthService licenseService) : InteractionModuleBase<SocketInteractionContext>
{
    private readonly IOAuthClient _authClient = authClient;
    private readonly ILicenseAuthService _licenseService = licenseService;

    //[SlashCommand("redeem-code", "redeem code given by the launcher")]
    //public async Task HandleRedeemDiscordCode(string code)
    //{
    //    await DeferAsync(ephemeral: true);
    //    if(Context.User is not SocketGuildUser user)
    //    {
    //        await FollowupAsync("Something went wrong.");
    //        return;
    //    }
    //    var tokenResponse = await _authClient.GetAccessToken();
    //    if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
    //    {
    //        await FollowupAsync("Failed to retrieve access token.");
    //        return;
    //    }
    //    if(code.Length != 20)
    //    {
    //        await FollowupAsync("Please input a valid license.");
    //        return;
    //    }
    //    if(!(await _licenseService.ConfirmDiscordLicense(tokenResponse.AccessToken, code.ToString(), user.Id)))
    //    {
    //        await FollowupAsync("Invalid Code.");
    //        return;
    //    }
    //    var ownerRole = base.Context.Guild.Roles.FirstOrDefault((SocketRole x) => x.Name == "Owner");
    //    if(ownerRole == null)
    //    {
    //        await user.AddRoleAsync(await base.Context.Guild.CreateRoleAsync("Owner", GuildPermissions.None, Color.Green, isHoisted: false, isMentionable: true));
    //        await FollowupAsync("License Redeemed Successfully!");
    //        return;
    //    }
    //    if(!user.Roles.Contains(ownerRole))
    //    {
    //        await user.AddRoleAsync(ownerRole);
    //    }
    //    await FollowupAsync("License Redeemed Successfully!");
    //}
}
