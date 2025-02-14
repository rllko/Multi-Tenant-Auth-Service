using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Endpoints.Authorization;

[Table("clients")]
public class Client
{
    [Key] [Column("client_id")] public int ClientId { get; set; }

    [Column("client_identifier")] public string? ClientIdentifier { get; init; }

    [Column("client_secret")] public string? ClientSecret { get; set; }

    [Column("grant_type")] public string? GrantType { get; set; }

    [Column("client_uri")] public string? ClientUri { get; set; }
}