using Authentication.Models;

namespace Authentication.Services.Tenants;

public interface ITenantService
{
    Task<Result<TenantSessionInfo, ValidationFailed>> LoginAsync(string username, string password, string ip,
        string userAgent);

    Task<TenantSessionInfo?> GetSessionAsync(string sessionToken);

    // Task<DashboardStats> GetDashboardStatsAsync(Guid tenantId);

    Task<bool> RefreshSessionAsync(string sessionToken);

    Task<bool> LogoutAsync(string sessionToken);

    Task<IEnumerable<TenantSessionInfo>> GetActiveSessionsAsync(Guid tenantId);

    Task RevokeAllOtherSessionsAsync(string currentToken, Guid tenantId);
}