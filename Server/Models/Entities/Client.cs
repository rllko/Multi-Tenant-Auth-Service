using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("clients")]
public class Client
{
    [Key]
    public int ClientId { get; set; }
    
    public string? ClientIdentifier { get; set; }
    
    public string? ClientSecret { get; set; }  // (you noted you might want to revisit this later)
    
    public string? GrantType { get; set; }
    
    public int? Role { get; set; }
    
    public Guid? Team { get; set; }
    
    public string? ClientUri { get; set; }
}