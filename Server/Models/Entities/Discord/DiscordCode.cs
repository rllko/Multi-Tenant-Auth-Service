namespace Authentication.Models.Entities.Discord;

public record DiscordCode
{
    public required License User { get; init; }
    public DateTime CreationTime { get; init; } = DateTime.UtcNow;
    public bool IsExpired => DateTime.UtcNow > CreationTime.AddMinutes(30);
}