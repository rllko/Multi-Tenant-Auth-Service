using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public class UserSession(
    Guid sessionId,
    Guid authorizationToken,
    Hwid hwid,
    long hwidId,
    long licenseId,
    License license,
    string ipAddress,
    long expiresAt,
    DateTime createdAt,
    DateTime? refreshedAt)
{
    public Guid SessionId { get; } = sessionId;
    public Guid? AuthorizationToken { get; set; } = authorizationToken;
    public Hwid Hwid { get; set; } = hwid;
    public long HwidId { get; set; } = hwidId;
    public long LicenseId { get; } = licenseId;
    public License License { get; set; } = license;
    public string IpAddress { get; } = ipAddress;
    public long ExpiresAt { get; set; } = expiresAt;
    public DateTime CreatedAt { get; } = createdAt;
    public DateTime? RefreshedAt { get; set; } = refreshedAt;
}