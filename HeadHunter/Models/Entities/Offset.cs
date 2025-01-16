using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Models.Entities;

[Table("offsets")]
public partial class Offset
{
    [Column("list", TypeName = "jsonb")]
    public string? List { get; set; }

    [Key]
    [Column("id")]
    public int Id { get; set; }
}
