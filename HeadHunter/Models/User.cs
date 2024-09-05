using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Models;

[Table("users")]
public partial class User
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("hwid")]
    [StringLength(150)]
    public string Hwid { get; set; } = null!;

    [Column("license")]
    [StringLength(150)]
    public string License { get; set; } = null!;

    [Column("email")]
    [StringLength(150)]
    public string? Email { get; set; }

    [Column("discord")]
    public long? Discord { get; set; }
}
