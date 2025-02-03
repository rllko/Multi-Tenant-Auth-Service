using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Models.Entities;

[Table("useractivitylog")]
public partial class Useractivitylog
{
    [Key]
    [Column("useractivitylogid")]
    public long Useractivitylogid { get; set; }

    [Column("targetid")]
    public long? Targetid { get; set; }

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
    public virtual User? Target { get; set; }
}
