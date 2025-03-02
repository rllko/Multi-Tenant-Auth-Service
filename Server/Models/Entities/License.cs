using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Authentication.Models.Entities.Discord;

namespace Authentication.Models.Entities;

[Table("licenses")]
public class License
{
    [Key] [Column("id")] public long Id { get; init; }

    [Column("license")]
    [StringLength(150)]
    public Guid Value { get; init; }

    public string? Password { get; set; }
    public DateTime ActivatedAt { get; set; }
    public string? Username { get; set; }
    public short MaxSessions { get; set; }
    public DateTime CreationDate { get; set; } = DateTime.Now;

    public long ExpirationDate { get; set; }

    [Column("discord")] public long? DiscordId { get; set; }
    public string? Email { get; set; }
    public bool Paused { get; set; }
    public bool Activated { get; set; }
    public DiscordUser? Discord { get; set; }
}

public class LicenseDto
{
    public required string Value { get; init; }
    public DateTime CreationDate { get; init; }
    public bool Activated { get; init; }
    public bool Paused { get; init; }
    public long ExpirationDate { get; init; }
    public string? Email { get; init; }
    public long? Discord { get; init; }
}