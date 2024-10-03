using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.DatabaseShaita;

[Table("users")]
[Index("License", Name = "users_license_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("hwid")]
    public List<string>? Hwid { get; set; }

    [Column("license")]
    [StringLength(150)]
    public string License { get; set; } = null!;

    [Column("email")]
    [StringLength(150)]
    public string? Email { get; set; }

    [Column("ip_address")]
    [StringLength(40)]
    public string? IpAddress { get; set; }

    [Column("key_reset_count")]
    public int? KeyResetCount { get; set; }

    [Column("discord_user")]
    public long? DiscordUser { get; set; }

    [Column("persistent_token")]
    [StringLength(40)]
    public string? PersistentToken { get; set; }

    [Column("last_token")]
    public DateTime? LastToken { get; set; }

    [ForeignKey("DiscordUser")]
    [InverseProperty("Users")]
    public virtual DiscordUser? DiscordUserNavigation { get; set; }
}
