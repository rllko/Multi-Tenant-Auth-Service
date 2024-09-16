using Discord;
using Discord.Interactions;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;

namespace DiscordTemplate.Modules;

[RequireRole(1284521231135281193)]
public class LicenseModule : InteractionModuleBase<SocketInteractionContext>
{
    private readonly IOAuthClient _authClient;
    private readonly ILicenseAuthService _licenseService;

    public LicenseModule(IOAuthClient authClient, ILicenseAuthService licenseService)
    {
        _authClient = authClient;
        _licenseService = licenseService;
    }

    [SlashCommand("generate-key", "generates a key")]
    public async Task HandleCreate([Summary(description: "Leave null if none")] IUser? user)
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
        if(keyResponse != null)
        {
            await user.CreateDMChannelAsync().Result.SendMessageAsync($"Key created successfully: ``` {keyResponse} ```");
            await DeleteOriginalResponseAsync();
            await FollowupAsync(ephemeral: true, text: "Success!");
        }
        else
        {
            await FollowupAsync("Failed to create key.");
        }
    }
}
