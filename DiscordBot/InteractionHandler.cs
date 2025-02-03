using Discord.Interactions;
using Discord.WebSocket;
using System.Reflection;

namespace DiscordTemplate
{
    public class InteractionHandler(DiscordSocketClient client, InteractionService commands, IServiceProvider services)
    {
        private readonly DiscordSocketClient _client = client;
        private readonly InteractionService _commands = commands;
        private readonly IServiceProvider _services = services;

        public async Task InitializeAsync()
        {
            // Find and Load the Interaction Modules from the current project
            await _commands.AddModulesAsync(Assembly.GetEntryAssembly(), _services);

            // Assign Interaction Event Handler to route to modules
            _client.InteractionCreated += HandleInteraction;
        }

        /// <summary>
        /// In Discord theres 5 types of Interactions:
        /// Ping ( if you ping the bot, it counts as a message command)
        /// * ApplicationCommand
        /// * MessageComponent
        /// * ApplicationCommandAutoComplete
        /// * And a ModalSubmit
        /// </summary>
        /// <param name="arg">
        /// A readonly object that stores anything about the
        /// interaction and the channel it was made
        /// </param>
        /// <returns></returns>
        private async Task HandleInteraction(SocketInteraction arg)
        {
            try
            {
                var ctx = new SocketInteractionContext(_client,arg);
                // Then Execute the command inside the Interaction Module
                await _commands.ExecuteCommandAsync(ctx, _services);

            }
            catch(Exception e)
            {
                Console.WriteLine(e.ToString());
            }
        }
    }
}