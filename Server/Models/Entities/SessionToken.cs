using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("session_tokens")]
public record SessionToken(
    int SessionId,
    Guid AuthorizationToken,
    License License,
    string IpAddress,
    DateTime Expiration,
    DateTime IssuedAt,
    DateTime? RefreshedAt);