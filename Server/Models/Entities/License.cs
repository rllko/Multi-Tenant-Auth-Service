using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("licenses")]
public class License
{
    [Key] [Column("id")] public long Id { get; init; }

    [Column("license")]
    [StringLength(150)]
    public required Guid Value { get; init; }

    public string? Password { get; set; }
    public string? Username { get; set; }

    [Column("creation_date", TypeName = "timestamp without time zone")]
    public required DateTime CreationDate { get; init; }

    [Column("discord")] public long? Discord { get; set; }
    public string? Email { get; set; }

    [ForeignKey("Hwid")]
    [InverseProperty("Users")]
    public Hwid? Hw { get; set; }
}

public class LicenseDto
{
    public required string Value { get; init; }
    public DateTime CreationDate { get; init; }
    public string? Email { get; init; }
    public long? Discord { get; init; }
}