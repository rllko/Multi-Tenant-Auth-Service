using System.ComponentModel;
using System.Net.Http.Headers;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.OAuth;
using DiscordTemplate.Services.Data_Fetch;
using DiscordTemplate.Services.Licenses;

namespace Discord.Services.DataFetchingService;

public class FetchingService(HttpClient httpClient, DiscordSocketClient socketClient) : IFetchingService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly DiscordSocketClient _client = socketClient;

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
        At:``{DateTime.Now}``
        Message:
        ```
        >{exceptionLog.ExceptionMessage}
        ```
        StackTrace: 
        ```
        >{exceptionLog.StackTrace}
        ```
        """);
    }

    public async static Task<DataFetchingResponse<string>> GetUserPermissionsAsync(SocketUser user, IOAuthClient oAuthClient)
    {
        var license = new DataFetchingResponse<string>();

        var tokenResponse  = await oAuthClient.GetAccessToken();
        var discordId = user.Id;
        
        if (tokenResponse is null)
        {
            license.Error = "Failed to get access token";
            return license;
        }
        
        if(discordId <= 0L || string.IsNullOrEmpty(tokenResponse?.AccessToken))
        {
            license.Error = "Invalid License or DiscordID";
            return license;
        }

        #warning create user details endpoint, send a get request to it 
        //string endpoint = $"{_api!.GetLicenseDetails}/{discordId}";

        //var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        //request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        //using var httpResponseMessage = await _httpClient.SendAsync(request);
        //var jsonresponse = await httpResponseMessage.Content.ReadAsStringAsync();
        //license = LicenseResponse<string>.Parse(jsonresponse);
        return license;
        
        return new DataFetchingResponse<string>(){Result = "You do not have permission to use this command.",Error = ""};
    }
}