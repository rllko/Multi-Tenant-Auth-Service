using System.ComponentModel.DataAnnotations.Schema;
using FastEndpoints;

namespace Authentication.Endpoints.Authorization;

[Table("clients")]
public class Client
{
    [BindFrom("client_id")] public int ClientId { get; set; }

    [BindFrom("client_identifier")] public required string ClientIdentifier { get; init; }

    [BindFrom("client_secret")] public required string ClientSecret { get; set; }

    [BindFrom("grant_type")] public required string GrantType { get; set; }

    [BindFrom("client_uri")] public required string ClientUri { get; set; }
}