using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Roles;

public interface IRoleService
{
    Task<Option<Role>> GetRoleByIdAsync(Guid roleId);
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task<Role> CreateRoleAsync(CreateRoleDto roleDto, IDbTransaction? transaction = null);
    Task<bool> UpdateRoleAsync(Guid roleId, UpdateRoleDto roleDto, IDbTransaction? transaction = null);
    Task<bool> DeleteRoleAsync(Guid roleId, IDbTransaction? transaction = null);

    Task<bool> AssignScopeToRoleAsync(Guid roleId, Guid scopeId, IDbTransaction? transaction = null);
    Task<bool> RemoveScopeFromRoleAsync(Guid roleId, Guid scopeId, IDbTransaction? transaction = null);
    Task<IEnumerable<int>> GetScopesInRoleAsync(int roleId);
}