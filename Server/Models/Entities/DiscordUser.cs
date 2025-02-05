using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("discord_users")]
public class DiscordUser
{
    [Key] [Column("discord_id")] public long DiscordId { get; set; }

    [Column("date_linked", TypeName = "timestamp without time zone")]
    public DateTime? DateLinked { get; set; }

    [InverseProperty("DiscordUserNavigation")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}