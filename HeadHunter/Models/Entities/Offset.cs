using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
