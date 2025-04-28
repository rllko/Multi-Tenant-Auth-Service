using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("scope_categories")]
public class ScopeCategory
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string Slug { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}