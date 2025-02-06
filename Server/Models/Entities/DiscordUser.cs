using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("discords")]
public class DiscordUser
{
    [Key] [Column("discord_id")] public long DiscordId { get; set; }

    [Column("email")] public string? Email { get; set; }

    [Column("date_linked", TypeName = "timestamp without time zone")]
    public required DateTime DateLinked { get; set; }

    [InverseProperty("DiscordUserNavigation")]
    public virtual ICollection<License> Users { get; set; } = new List<License>();
}