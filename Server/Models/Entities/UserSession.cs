using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("user_sessions")]
public class UserSession
{
    public UserSession()
    {
    }

    public UserSession(Guid sessionId,
        Guid authorizationToken,
        Hwid? hwid,
        long hwidId,
        long licenseId,
        License? license,
        string ipAddress,
        long refreshesAt,
        long createdAt,
        long? refreshedAt)
    {
        SessionId = sessionId;
        AuthorizationToken = authorizationToken;
        Hwid = hwid;
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
    public License? License { get; set; }
    public string IpAddress { get; }

    public bool Active { get; set; } = true;
    public long CreatedAt { get; init; }
    public long? RefreshedAt { get; set; }
}