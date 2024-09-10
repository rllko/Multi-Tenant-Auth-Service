using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeadHunter.Models.Entities;

[Table("scopes")]
[Index("ScopeName", Name = "scopes_scope_name_key", IsUnique = true)]
public partial class Scope
{
    [Key]
    [Column("scope_id")]
    public int ScopeId { get; set; }

    [Column("scope_name")]
    [StringLength(255)]
    public string ScopeName { get; set; } = null!;

    [ForeignKey("ScopeId")]
    [InverseProperty("Scopes")]
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
}
