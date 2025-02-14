using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("activity_logs")]
public record UserActivityLog
{
    [Key] [Column("useractivitylogid")] public long Useractivitylogid { get; set; }

    [Column("targetid")] public long? TargetId { get; set; }

    [Column("ipaddress")]
    [StringLength(50)]
    public string IpAddress { get; set; } = null!;

    [Column("activitytype")]
    [StringLength(100)]
    public string Activitytype { get; set; } = null!;

    [Column("interactiontime", TypeName = "timestamp without time zone")]
    public DateTime? InteractionTime { get; set; }

    [ForeignKey("TargetId")]
    [InverseProperty("Useractivitylogs")]
    public License? Target { get; set; }
}