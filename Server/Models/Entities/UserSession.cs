using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public record UserSession(
    int SessionId,
    Guid AuthorizationToken,
    License License,
    string IpAddress,
    DateTime Expiration,
    DateTime IssuedAt,
    DateTime? RefreshedAt);