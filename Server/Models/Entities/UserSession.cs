using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public class UserSession(
    int sessionId,
    Guid authorizationToken,
    Hwid hwid,
    long hwidId,
    long licenseId,
    License license,
    string ipAddress,
    long expirationTime,
    DateTime createdAt,
    DateTime? refreshedAt)
{
    public int SessionId { get; } = sessionId;
    public Guid? AuthorizationToken { get; set; } = authorizationToken;
    public Hwid Hwid { get; set; } = hwid;
    public long HwidId { get; set; } = hwidId;
    public long LicenseId { get; } = licenseId;
    public License License { get; set; } = license;
    public string IpAddress { get; } = ipAddress;
    public long ExpirationTime { get; set; } = expirationTime;
    public DateTime CreatedAt { get; } = createdAt;
    public DateTime? RefreshedAt { get; set; } = refreshedAt;
}