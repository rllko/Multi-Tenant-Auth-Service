using Discord.WebSocket;
using DiscordTemplate.OAuth;

namespace DiscordTemplate.Services.Data_Fetch
{
    public interface IFetchingService
    {
        public Task<string> FetchFileContentAsJson(string path);
        public Task SendMessageExceptionToChannelAsync(IProtectedEndpoint exceptionLog, SocketUser user);
    }
}
