using Redis.OM.Modeling;

namespace Authentication.Models;

public class TenantSessionInfo
{
    [Indexed]
    public Guid TenantId { get; set; }

    [Indexed]
    public required string SessionToken { get; set; }
    
    [Indexed] 
    public required string Ip { get; set; }

    [Indexed]
    public required string UserAgent { get; set; }
    
    [Indexed]
    public required DateTime Created { get; set; }
    
    [Indexed]
    public required DateTime Expires { get; set; }
}