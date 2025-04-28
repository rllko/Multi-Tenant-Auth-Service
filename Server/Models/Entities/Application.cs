using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("applications")]
public class Application
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public required string ClientDecryptionChaChaKey { get; set; }
    public required string ServerApiSecret { get; set; }
    public Guid DefaultKeySchema { get; set; }
    public Guid? Team { get; set; }
}