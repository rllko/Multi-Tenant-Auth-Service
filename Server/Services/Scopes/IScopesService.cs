using System.Data;
using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Authentication.Models.Entities;
using LanguageExt;
using Scope = Authentication.Models.Entities.Scope;

namespace Authentication.Services.Scopes;

public interface IScopeService
{
    Task<Scope> CreateScopeAsync(ScopeCreateDto dto, IDbTransaction? transaction = null);
    Task<Option<Models.Entities.Scope>> GetScopeByIdAsync(Guid scopeId);
    Task<IEnumerable<Scope>> GetAllScopesAsync();
    Task<bool> DeleteScopeAsync(Guid scopeId, IDbTransaction? transaction = null);
}