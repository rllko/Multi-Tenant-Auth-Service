using Redis.OM.Modeling;

namespace Authentication.Models;

public class AuthorizationCodeRequest
{
    [Indexed] public required string? ClientId { get; set; }

    [Indexed] public DateTime CreationTime { get; set; } = DateTime.UtcNow.ToUniversalTime();
    [Indexed] public string Key { get; set; }
    [Indexed] public string? Code { get; set; } = null;
    [Indexed] public bool IsExpired => DateTime.UtcNow.ToUniversalTime() > CreationTime.AddSeconds(30);
}