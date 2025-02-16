using FastEndpoints;

namespace Authentication.Models;

public class AuthorizationCodeRequest
{
    [BindFrom("client_id")] public required string? ClientIdentifier { get; set; }

    public DateTime CreationTime { get; set; } = DateTime.UtcNow.ToUniversalTime();
    public string? Code { get; set; } = null;
    public bool IsExpired => DateTime.UtcNow.ToUniversalTime() > CreationTime.AddSeconds(30);
}