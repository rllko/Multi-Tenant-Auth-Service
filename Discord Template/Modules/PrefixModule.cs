using Discord.Commands;

namespace ConsoleApp5.Modules
{
    public class PrefixModule : ModuleBase<SocketCommandContext>
    {
        [Command("ping")]
        public async Task HandlePingCommand()
        {
            await ReplyAsync("Pong!");
        }
    }
}
