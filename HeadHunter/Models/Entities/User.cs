using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeadHunter.Models.Entities;

[Table("users")]
[Index("License", Name = "users_license_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("license")]
    [StringLength(150)]
    public string License { get; set; } = null!;

    [Column("email")]
    [StringLength(150)]
    public string? Email { get; set; }

    [Column("key_reset_count")]
    public int? KeyResetCount { get; set; }

    [Column("discord_user")]
    public long? DiscordUser { get; set; }

    [Column("hwid")]
    public long? Hwid { get; set; }

    [Column("persistent_token")]
    [StringLength(40)]
    public string? PersistentToken { get; set; }

    [Column("last_token")]
    public DateTime? LastToken { get; set; }

    [Column("creation_date", TypeName = "timestamp without time zone")]
    public DateTime? CreationDate { get; set; }

    [ForeignKey("DiscordUser")]
    [InverseProperty("Users")]
    public virtual DiscordUser? DiscordUserNavigation { get; set; }

    [ForeignKey("Hwid")]
    [InverseProperty("Users")]
    public virtual Hwid? Hw { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserActivityLog> Useractivitylogs { get; set; } = [];
}
