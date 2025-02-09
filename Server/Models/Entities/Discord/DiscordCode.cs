namespace Authentication.Models.Entities.Discord;

public record DiscordCode
{
    public required License UserLicense { get; init; }
    public DateTime CreationTime { get; init; } = DateTime.UtcNow;
    public bool IsExpired => DateTime.UtcNow > CreationTime.AddMinutes(30);
}

public record RedeemDiscordCodeDto(string code, ulong discordId);