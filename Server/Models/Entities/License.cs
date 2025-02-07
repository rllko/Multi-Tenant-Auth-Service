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
    public required Guid Value { get; init; }

    [Column("creation_date", TypeName = "timestamp without time zone")]
    public required DateTime CreationDate { get; init; }

    [ForeignKey("DiscordUser")]
    [InverseProperty("Users")]
    public DiscordUser? DiscordUser { get; init; }

    [ForeignKey("Hwid")]
    [InverseProperty("Users")]
    public Hwid? Hw { get; set; }

    [InverseProperty("Target")]
    public ICollection<UserActivityLog> ActivityLogs { get; init; } = new List<UserActivityLog>();
}

public record LicenseDto(Guid Value, DateTime CreationDate, DiscordUser? DiscordUser);
