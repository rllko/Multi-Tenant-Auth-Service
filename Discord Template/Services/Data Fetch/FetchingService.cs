using Discord.WebSocket;
using DiscordTemplate.OAuth;
using DiscordTemplate.Services.Data_Fetch;

namespace Discord.Services.DataFetchingService;

public class FetchingService(HttpClient httpClient, DiscordSocketClient SocketClient) : IFetchingService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly DiscordSocketClient _client = SocketClient;
    //private readonly IOAuthClient _authClient = authClient;

    //public async Task<string> getAccessToken()
    //{
    //    var tokenResponse = await _authClient.GetAccessToken();
    //    if(tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
    //    {
    //        await FollowupAsync("Failed to retrieve access token.");
    //        return;
    //    }
    //}

    public async Task<string> FetchFileContentAsJson(string url)
    {
        using var response = await _httpClient.GetAsync(url);
        return await response.Content.ReadAsStringAsync();
    }

    public async Task SendMessageToChannelAsync(string message, ulong channelId = 1291513928299315240)
    {
        // Get the channel by ID

        if(_client.GetChannel(channelId) is IMessageChannel channel)
        {
            await channel.SendMessageAsync(message);
        }
        else
        {
            Console.WriteLine("Couldnt find channel");
        }
    }

    public async Task SendMessageExceptionToChannelAsync(IProtectedEndpoint exceptionLog, SocketUser user)
    {
        await SendMessageToChannelAsync(
        $"""
        {user.Username} caused an exception!
        At:{DateTime.Now}
        Message:
        ```
        {exceptionLog.ExceptionMessage}
        ```
        StackTrace: 
        ```
        {exceptionLog.StackTrace}
        ```
        """);
    }
}