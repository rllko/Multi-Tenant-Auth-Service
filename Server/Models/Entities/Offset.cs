using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("offsets")]
public class Offset
{
    [Column("list", TypeName = "jsonb")] public string? List { get; set; }

    [Key] [Column("id")] public int Id { get; set; }
}