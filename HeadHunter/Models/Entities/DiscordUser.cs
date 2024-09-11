using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeadHunter.Models.Entities;

[Table("discord_users")]
public partial class DiscordUser
{
    [Key]
    [Column("discord_id")]
    public long DiscordId { get; set; }

    [Column("date_linked", TypeName = "timestamp without time zone")]
    public DateTime? DateLinked { get; set; }

    public bool Confirmed => DateLinked.HasValue || DiscordId != 0;

    [InverseProperty("DiscordUserNavigation")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
