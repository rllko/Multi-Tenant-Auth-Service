using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Invites;

public interface IInviteService
{
    Task<Option<TenantInvite>> CreateInviteAsync(string email, string message, Guid teamId, Guid createdByGuid,
        IDbTransaction? transaction = null);

    Task<Option<TenantInvite>> GetInviteByTokenAsync(string token);
    Task<IEnumerable<TenantInviteDto>> GetInvitesByTenantIdAsync(Guid tenantId);
    Task<IEnumerable<TenantInviteDto>> GetInvitesPendingByTenantIdAsync(Guid tenantId);
    Task<IEnumerable<TenantInviteDto>> GetInvitesSentByTenantIdAsync(Guid tenantId);

    Task<bool> AcceptInviteAsync(string token, Guid teamId, Guid userId, Guid invitedBy,
        IDbTransaction? transaction = null);

    Task<bool> DeleteInviteAsync(string id, IDbTransaction? transaction = null);
}