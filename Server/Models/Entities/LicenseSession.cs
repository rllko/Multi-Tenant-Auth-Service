using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public class LicenseSession
{
    public LicenseSession()
    {
    }

    public LicenseSession(Guid sessionId,
        Guid authorizationToken,
        long hwidId,
        long licenseId,
        License license,
        string ipAddress,
        long refreshesAt,
        long createdAt,
        long? refreshedAt)
    {
        SessionId = sessionId;
        AuthorizationToken = authorizationToken;
        HwidId = hwidId;
        LicenseId = licenseId;
        License = license;
        IpAddress = ipAddress;
        CreatedAt = createdAt;
        RefreshedAt = refreshedAt;
    }

    public Guid SessionId { get; init; }
    public Guid? AuthorizationToken { get; set; }
    public Hwid? Hwid { get; set; }
    public long? HwidId { get; set; }
    public long LicenseId { get; init; }
    public License License { get; set; }
    public string? IpAddress { get; }

    public bool Active { get; set; } = true;
    public long CreatedAt { get; init; }
    public long? RefreshedAt { get; set; }
}