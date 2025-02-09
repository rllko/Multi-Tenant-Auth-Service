using Authentication.Models.Entities;

namespace Authentication.Models;

public class DiscordCode
{
    public required License License { get; init; }
    public DateTime CreationTime { get; init; } = DateTime.UtcNow;
}