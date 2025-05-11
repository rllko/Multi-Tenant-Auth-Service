using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Teams;

public interface ITeamService
{
    Task<Option<Team>> GetTeamByIdAsync(Guid teamId);
    Task<Option<IEnumerable<Team>>> GetTeamsForUserAsync(Guid userId);
    Task<IEnumerable<Team>> GetAllTeamsAsync();
    Task<Option<IEnumerable<string>>> GetScopesForUserInTeamAsync(Guid userId, Guid teamId);
    Task<bool> CheckUserScopesAsync(Guid userId, string teamId, string permissionSlug);

    Task<Result<TeamDto, ValidationFailed>> CreateTeamAsync(TeamCreateDto teamDto, Guid createdBy,
        IDbTransaction? transaction = null);

    Task<bool> UpdateTeamAsync(Guid teamId, TeamUpdateDto teamDto, IDbTransaction? transaction = null);
    Task<bool> DeleteTeamAsync(Guid teamId, IDbTransaction? transaction = null);
    Task<Option<IEnumerable<Role>>> GetTeamRolesAsync(Guid teamId);
    Task<Option<IEnumerable<ScopeDto>>> GetTeamScopesAsync(Guid teamId);
    Task<bool> AddUserToTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null);
    Task<bool> RemoveUserFromTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null);
    Task<IEnumerable<TenantDto>> GetTenantsInTeamAsync(Guid teamId);
}