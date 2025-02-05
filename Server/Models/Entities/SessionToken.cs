namespace Authentication.Models.Entities;

public record SessionToken(
    int SessionId,
    Guid Token,
    long LicenseId,
    string IpAddress,
    DateTime Expiration,
    DateTime IssuedAt,
    DateTime? RefreshedAt);