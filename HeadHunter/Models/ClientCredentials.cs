using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HeadHunter.Models;

[Table("clients")]
public partial class Client
{
    [Key]
    [Column("clientid")]
    [StringLength(150)]
    public string Clientid { get; set; } = null!;

    [Column("clientsecret")]
    [StringLength(150)]
    public string Clientsecret { get; set; } = null!;

    [Column("allowedscopes", TypeName = "character varying(40)[]")]
    public List<string> Allowedscopes { get; set; } = null!;

    [Column("granttype")]
    [StringLength(20)]
    public string Granttype { get; set; } = null!;

    [Column("clienturi")]
    [StringLength(150)]
    public string? Clienturi { get; set; }

    [Column("redirecturi")]
    [StringLength(150)]
    public string? Redirecturi { get; set; }
}
