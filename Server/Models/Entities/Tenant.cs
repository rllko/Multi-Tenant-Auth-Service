namespace Authentication.Models.Entities;

public class Tenant
{
    public Tenant(Guid id, long discordId, string name, string email, DateTime activatedAt)
    {
        Id = id;
        DiscordId = discordId;
        Name = name;
        Email = email;
        ActivatedAt = activatedAt;
    }

    public Tenant()
    {
    }

    public Guid Id { get; set; }
    public long DiscordId { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required DateTime ActivatedAt { get; set; }
}