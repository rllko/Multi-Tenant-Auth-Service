using System.ComponentModel.DataAnnotations.Schema;
using Authentication.Services;

namespace Authentication.Models.Entities;

[Table("licenses")]
public class License
{
    public long Id { get; init; }

    public Guid Value { get; init; }
    public Guid Application { get; set; }

    public string? Password { get; set; }
    public long? ActivatedAt { get; set; }
    public string? Username { get; set; }
    public short MaxSessions { get; set; } = 1;
    public DateTimeOffset CreationDate { get; set; } = DateTimeOffset.UtcNow;

    public long ExpiresAt { get; set; }

    [Column("discord")] public long? DiscordId { get; set; }
    public string? Email { get; set; }
    public bool Paused { get; set; }
    public bool Activated { get; set; }
    public bool Banned { get; set; }
    public bool Revoked { get; set; }
    public long? RevokedAt { get; set; }
    public DiscordUser? Discord { get; set; }

    public LicenseDto MapToDto()
    {
        return new LicenseDto
        {
            Id = Id,
            Value = Guider.ToStringFromGuid(Value),
            Email = Email,
            Username = Username,
            MaxSessions = MaxSessions,
            ExpirationDate = ExpiresAt,
            Activated = Activated,
            Paused = Paused,
            Banned = Banned,
            Revoked = Revoked,
            RevokedAt = RevokedAt,
            CreationDate = CreationDate.ToUnixTimeSeconds(),
            Discord = DiscordId
        };
    }

    public string MapToString()
    {
        return Guider.ToStringFromGuid(Value);
    }
}

public class LicenseDto
{
    public long Id { get; init; }
    public required string Value { get; init; }
    public long CreationDate { get; init; }
    public bool Activated { get; init; }
    public bool Paused { get; init; }
    public bool Banned { get; init; }
    public bool Revoked { get; init; }
    public long? RevokedAt { get; init; }
    public long ExpirationDate { get; init; }
    public string? Email { get; init; }
    public string? Username { get; init; }
    public short MaxSessions { get; init; }
    public long? Discord { get; init; }
}