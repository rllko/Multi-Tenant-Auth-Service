using Discord;
using Discord.Commands;
using Discord.Interactions;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Licenses;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DiscordTemplate;
public class Program
{
    public static Task Main() => new Program().MainAsync();

    public async Task MainAsync()
    {
        var config =  new ConfigurationBuilder()
            .SetBasePath( Directory.GetParent(Directory.GetCurrentDirectory()!)!.Parent!.Parent!.FullName)
            .AddJsonFile("config.json", optional: false)
            .Build();

        using IHost host = Host.CreateDefaultBuilder()
            .ConfigureServices((_, services) =>
                services
                .AddSingleton(config)
                .AddHttpClient()
                .AddSingleton<IOAuthClient,OAuthClient>()
                .AddSingleton<ILicenseAuthService, LicenseAuthService>()
                .AddSingleton( x=> new DiscordSocketClient(new DiscordSocketConfig
                {
                    GatewayIntents = GatewayIntents.AllUnprivileged,
                    AlwaysDownloadUsers = true,
                }))
                .AddSingleton(x => new InteractionService(x.GetRequiredService<DiscordSocketClient>()))
                .AddSingleton<InteractionHandler>()
                .AddSingleton(x => new CommandService())
                .AddSingleton<PrefixHandler>()
            ).Build();


        await RunAsync(host);
    }

    /// <summary>
    /// Theres two types of commands, Prefix and Interaction.
    /// 
    /// Prefix commands are the traditional commands that start with a prefix
    /// and only require the PrefixHandler to be initialized.
    /// 
    /// Interaction commands are the new slash commands that require the InteractionHandler
    /// 
    /// </summary>
    /// <returns></returns>
    public async Task RunAsync(IHost host)
    {
        // Create a Service Scope to obtain the DI instances
        using IServiceScope scope = host.Services.CreateScope();
        IServiceProvider provider = scope.ServiceProvider;

        // Get the Discord Client from services
        var _client = provider.GetRequiredService<DiscordSocketClient>();

        // Get the Configuration file content from services
        var config = provider.GetRequiredService<IConfigurationRoot>();

        // Get the Api Configuration from the Configuration file
        config.GetSection("ApiConfiguration").Get<ApiConfiguration>();

        var oAuthClient = provider.GetRequiredService<IOAuthClient>();

        // You need a Service instance to register commands to your server
        var sCommands = provider.GetRequiredService<InteractionService>();

        // Initialize Interaction Handler
        await provider.GetRequiredService<InteractionHandler>().InitializeAsync();

        // Get the Prefix Command Handler from services
        var pCommands  = provider.GetRequiredService<PrefixHandler>();
        await pCommands.InitializeAsync();

        // Add The log events so we can see what is happening
        _client.Log += async (LogMessage message) => Console.WriteLine($"{message.Source}: {message.Message}");
        sCommands.Log += async (LogMessage message) => Console.WriteLine($"{message.Source}: {message.Message}");

        _client.Ready += async () =>
        {
            // Then register the commands to your guild
            await sCommands.RegisterCommandsGloballyAsync();
        };

        await _client.LoginAsync(Discord.TokenType.Bot, config ["token"]);
        await _client.StartAsync();
        await Task.Delay(-1);
    }
}
