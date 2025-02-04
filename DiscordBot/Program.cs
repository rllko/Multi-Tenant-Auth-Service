using Discord;
using Discord.Interactions;
using Discord.Services.DataFetchingService;
using Discord.WebSocket;
using DiscordTemplate.AuthClient;
using DiscordTemplate.Services.Data_Fetch;
using DiscordTemplate.Services.Licenses;
using DiscordTemplate.Services.Offsets;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DiscordTemplate;
public class Program
{
    public static Task Main() => new Program().MainAsync();

    private async Task MainAsync()
    {
        var config =  new ConfigurationBuilder()
            .SetBasePath( Directory.GetCurrentDirectory())
            .AddJsonFile("config.json", optional: false)
            .Build();

        using IHost host = Host.CreateDefaultBuilder()
            .ConfigureServices((_, services) =>
            {
                services.AddHttpClient();
                services
                    .AddSingleton(config)
                    .AddSingleton<IOAuthClient, OAuthClient>()
                    .AddSingleton<IFetchingService, FetchingService>()
                    .AddSingleton<IOffsetService, OffsetService>()
                    .AddSingleton<ILicenseAuthService, LicenseAuthService>()
                    .AddSingleton(_ => new DiscordSocketClient(new DiscordSocketConfig
                    {
                        GatewayIntents = GatewayIntents.All,
                        AlwaysDownloadUsers = true
                    }))
                    .AddSingleton(x => 
                        new InteractionService(x.GetRequiredService<DiscordSocketClient>()))
                    .AddSingleton<InteractionHandler>();
            }).Build();


        await RunAsync(host);
    }

    /// <summary>
    /// There's two types of commands, Prefix and Interaction.
    /// 
    /// Prefix commands are the traditional commands that start with a prefix
    /// and only require the PrefixHandler to be initialized.
    /// 
    /// Interaction commands are the new slash commands that require the InteractionHandler
    /// 
    /// </summary>
    /// <returns></returns>
    private static async Task RunAsync(IHost host)
    {
        // Create a Service Scope to obtain the DI instances
        using IServiceScope scope = host.Services.CreateScope();
        IServiceProvider provider = scope.ServiceProvider;

        // Get the Discord Client from services
        var client = provider.GetRequiredService<DiscordSocketClient>();

        // Get the Configuration file content from services
        var config = provider.GetRequiredService<IConfigurationRoot>();

        // Get the Api Configuration from the Configuration file
        config.GetSection("ApiConfiguration").Get<ApiConfiguration>();

        var oauth = provider.GetRequiredService<IOAuthClient>();

        // You need a Service instance to register commands to your server
        var sCommands = provider.GetRequiredService<InteractionService>();

        // Initialize Interaction Handler
        await provider.GetRequiredService<InteractionHandler>().InitializeAsync();

        // Add The log events so we can see what is happening
        client.Log += async message => Console.WriteLine($"{message.Source}: {message.Message}");
        client.UserJoined += async user => await FetchingService.GetUserPermissionsAsync(user,oauth);
        
        sCommands.Log += async message => Console.WriteLine($"{message.Source}: {message.Message}");
        
        client.Ready += async () =>
        {
            // Then register the commands to your guild
            await sCommands.RegisterCommandsToGuildAsync(1270275400513093643);
        };
        
        await client.SetCustomStatusAsync("Waiting for birdy to finish");
        await client.LoginAsync(TokenType.Bot, config ["token"]);
        await client.StartAsync();
        await Task.Delay(-1);
    }
}
