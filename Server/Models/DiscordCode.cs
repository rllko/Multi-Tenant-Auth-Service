using Authentication.Models.Entities;

namespace Authentication.Models;

public class DiscordCode
{
    public required User User { get; init; }
    public DateTime CreationTime { get; init; } = DateTime.UtcNow;

    public bool isExpired => DateTime.UtcNow > CreationTime.AddMinutes(30);
}