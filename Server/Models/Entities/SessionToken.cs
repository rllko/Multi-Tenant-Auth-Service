namespace Authentication.Models.Entities;

public record SessionToken(
    int SessionId,
    Guid Token,
    License License,
    string IpAddress,
    DateTime Expiration,
    DateTime IssuedAt,
    DateTime? RefreshedAt);