using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("useractivitylog")]
public class Useractivitylog
{
    [Key] [Column("useractivitylogid")] public long Useractivitylogid { get; set; }

    [Column("targetid")] public long? Targetid { get; set; }

    [Column("ipaddress")]
    [StringLength(50)]
    public string Ipaddress { get; set; } = null!;

    [Column("activitytype")]
    [StringLength(100)]
    public string Activitytype { get; set; } = null!;

    [Column("interactiontime", TypeName = "timestamp without time zone")]
    public DateTime? Interactiontime { get; set; }

    [ForeignKey("Targetid")]
    [InverseProperty("Useractivitylogs")]
    public virtual License? Target { get; set; }
}