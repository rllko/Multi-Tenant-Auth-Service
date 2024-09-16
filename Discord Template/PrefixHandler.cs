using Discord.Commands;
using Discord.WebSocket;
using Microsoft.Extensions.Configuration;
using System.Reflection;

namespace DiscordTemplate
{
    public class PrefixHandler(
        DiscordSocketClient client,
        CommandService commands,
        IConfigurationRoot reader,
        IServiceProvider services)
    {
        private readonly DiscordSocketClient _client = client;
        private readonly CommandService _commands = commands;
        private readonly IConfigurationRoot _reader = reader;
        private readonly IServiceProvider _services = services;

        public async Task InitializeAsync()
        {
            await _commands.AddModulesAsync(Assembly.GetEntryAssembly(), _services);

            _client.MessageReceived += HandleCommandAsync;
        }

        public async Task HandleCommandAsync(SocketMessage messageParam)
        {
            // means a message sent from user, null if bot
            var message = messageParam as SocketUserMessage;

            if(message == null)
            {
                return;
            }



            // position of command prefix
            int argPos = 0;

            // if user is bot or message does not have prefix, return
            if(!(message.HasCharPrefix(_reader ["prefix"]! [0], ref argPos)
                || message.HasMentionPrefix(_client.CurrentUser, ref argPos))
                || message.Author.IsBot)
            {
                return;
            }

            // create a context to execute the prefix module
            var context = new SocketCommandContext(_client,message);

            // execute the command
            await _commands.ExecuteAsync(context, argPos, _services);
        }
    }
}