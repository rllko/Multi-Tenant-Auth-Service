using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Teams;

public interface ITeamService
{
    Task<Option<Team>> GetTeamByIdAsync(Guid teamId);
    Task<Option<IEnumerable<Team>>> GetTeamsForUserAsync(Guid userId);
    Task<IEnumerable<Team>> GetAllTeamsAsync();
    Task<Team> CreateTeamAsync(TeamCreateDto teamDto, IDbTransaction? transaction = null);
    Task<bool> UpdateTeamAsync(Guid teamId, TeamUpdateDto teamDto, IDbTransaction? transaction = null);
    Task<bool> DeleteTeamAsync(Guid teamId, IDbTransaction? transaction = null);
    Task<bool> AddUserToTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null);
    Task<bool> RemoveUserFromTeamAsync(Guid teamId, Guid userId, IDbTransaction? transaction = null);
    Task<IEnumerable<Tenant>> GetTenantsInTeamAsync(Guid teamId);
}