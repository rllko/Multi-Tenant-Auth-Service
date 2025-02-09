using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public record UserSession(
    int SessionId,
    Guid AuthorizationToken,
    Hwid Hwid,
    long HwidId,
    long LicenseId,
    License License,
    string IpAddress,
    DateTime Expiration,
    DateTime CreatedAt,
    DateTime? RefreshedAt);