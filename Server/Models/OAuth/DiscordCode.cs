using Authentication.Models.Entities;

namespace Authentication.Models;

public class DiscordCode
{
    public required License License { get; init; }
    public DateTime CreationTime { get; init; } = DateTime.UtcNow;
    public DateTime ExpirationTime { get; init; } = DateTime.UtcNow.AddMinutes(30);
    public string? Code { get; set; }
}