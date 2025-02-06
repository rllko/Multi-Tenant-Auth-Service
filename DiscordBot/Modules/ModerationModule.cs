using Discord;
using Discord.Interactions;

namespace DiscordTemplate.Modules;

[Group("moderator", "mod commands")]
internal class ModerationModule : InteractionModuleBase<SocketInteractionContext>
{
    [RequireRole(1271229862962659479)]
    [SlashCommand("announce", "Announces a message to a channel")]
    public async Task AnnounceHandler(string message, string? title = null, string? imageUrl = null,
        string? thumbnailUrl = null)
    {
        var embed = new EmbedBuilder().WithTitle("Welcome to Authentication")
            .WithDescription(message).WithColor(Color.Blue)
            .WithImageUrl(imageUrl)
            .WithColor(Color.Green)
            .WithThumbnailUrl(thumbnailUrl)
            .WithTitle(title ?? "")
            .WithCurrentTimestamp()
            .Build();
        var button = new ButtonBuilder().WithCustomId("button").WithStyle(ButtonStyle.Success).WithLabel("Button");
        await ReplyAsync(null, false, embed, null, null, null, new ComponentBuilder().WithButton(button).Build());
    }
}