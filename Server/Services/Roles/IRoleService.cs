using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Roles;

public interface IRoleService
{
    Task<Option<Role>> GetRoleByIdAsync(int roleId);
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task<Role> CreateRoleAsync(CreateRoleDto roleDto, IDbTransaction? transaction = null);
    Task<bool> UpdateRoleAsync(int roleId, UpdateRoleDto roleDto, IDbTransaction? transaction = null);
    Task<bool> DeleteRoleAsync(int roleId, IDbTransaction? transaction = null);

    Task<bool> AssignScopeToRoleAsync(int roleId, int scopeId, IDbTransaction? transaction = null);
    Task<bool> RemoveScopeFromRoleAsync(int roleId, int scopeId, IDbTransaction? transaction = null);
    Task<IEnumerable<int>> GetScopesInRoleAsync(int roleId);
}