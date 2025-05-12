using Authentication.Endpoints.Authentication.TenantAuthentication;
using Authentication.Models;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Tenants;

public interface ITenantService
{
    Task<Result<TenantLoginResponse, ValidationFailed>> LoginAsync(string username, string password, string ip,
        string tenantAgent);

    Task<Result<Unit, ValidationFailed>> CreateTenantAsync(string email, string name, string password);
    Task<TenantSessionInfo?> GetSessionAsync(string sessionToken);

    Task<Option<TenantDto>> GetTenantByIdAsync(Guid teamId);
    Task<Option<TenantDto>> GetTenantByEmailAsync(string email);

    Task<Option<TenantSessionInfo>> RefreshSessionAsync(string sessionToken);

    Task<bool> LogoutAsync(string sessionToken);

    Task<IEnumerable<TenantSessionInfo>> GetActiveSessionsAsync(Guid tenantId);

    Task RevokeAllOtherSessionsAsync(string currentToken, Guid tenantId);
}