using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("clients")]
public class Client
{
    [Key] [Column("client_id")] public int ClientId { get; set; }

    [Column("client_identifier")]
    [StringLength(150)]
    public string? ClientIdentifier { get; set; }

    [Column("client_secret")]
    [StringLength(150)]
    public string? ClientSecret { get; set; }

    [Column("grant_type")]
    [StringLength(20)]
    public string? GrantType { get; set; }

    [Column("client_uri")]
    [StringLength(150)]
    public string? ClientUri { get; set; }

    [ForeignKey("ClientId")]
    [InverseProperty("Clients")]
    public virtual ICollection<Scope> Scopes { get; set; } = new List<Scope>();
}