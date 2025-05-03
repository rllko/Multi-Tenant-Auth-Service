using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("discords")]
public class DiscordUser
{
    [Key]
    public long DiscordId { get; set; }
    public DateTime DateLinked { get; set; } = DateTime.UtcNow;
}