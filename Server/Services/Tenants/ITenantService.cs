using Authentication.Models;

namespace Authentication.Services.Tenants;

public interface ITenantService
{
    Task<string?> LoginAsync(string username, string password, string ip, string userAgent);
    
    Task<TenantSessionInfo?> ValidateSessionAsync(string sessionToken);

    Task<bool> RefreshSessionAsync(string sessionToken);

    Task LogoutAsync(TenantSessionInfo sessionToken);

    Task<IEnumerable<TenantSessionInfo>> GetActiveSessionsAsync(Guid tenantId);

    Task RevokeAllOtherSessionsAsync(string currentToken, Guid tenantId);
}