using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeadHunter.Models.Entities;

[Table("useractivitylog")]
public partial class UserActivityLog
{
    [Key]
    [Column("useractivitylogid")]
    public long Useractivitylogid { get; set; }

    [Column("userid")]
    public long? Userid { get; set; }

    [Column("activitytype")]
    [StringLength(100)]
    public string Activitytype { get; set; } = null!;

    [Column("interactiontime", TypeName = "timestamp without time zone")]
    public DateTime Interactiontime { get; set; }

    [Column("ipaddress")]
    [StringLength(50)]
    public string? Ipaddress { get; set; }

    [ForeignKey("Userid")]
    [InverseProperty("Useractivitylogs")]
    public virtual User? User { get; set; }
}
