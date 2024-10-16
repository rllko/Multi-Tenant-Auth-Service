using Discord;
using Discord.Interactions;

namespace DiscordTemplate.Modules
{

    [Group("moderator", "mod commands")]
    internal class ModerationModule : InteractionModuleBase<SocketInteractionContext>
    {
        [RequireRole(1271229862962659479)]
        [SlashCommand("announce", "Announces a message to a channel", false, RunMode.Default)]
        public async Task AnnounceHandler(string message, string? title = null, string? imageUrl = null, string? thumbnailUrl = null)
        {
            Embed embed = new EmbedBuilder().WithTitle("Welcome to Headhunter").WithDescription(message).WithColor(Color.Blue)
            .WithImageUrl(imageUrl)
            .WithColor(Color.Green)
            .WithThumbnailUrl(thumbnailUrl)
            .WithTitle(title ?? "")
            .WithCurrentTimestamp()
            .Build();
            ButtonBuilder button = new ButtonBuilder().WithCustomId("button").WithStyle(ButtonStyle.Success).WithLabel("Button");
            await ReplyAsync(null, isTTS: false, embed, null, null, null, new ComponentBuilder().WithButton(button).Build());
        }
    }


}
