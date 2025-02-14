using System.Data;
using Authentication.Endpoints;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Hwids;

public interface IHwidService
{
    Task<Either<Hwid?, ValidationFailed>> CreateHwidAsync(HwidDto hwidDto, IDbTransaction? transaction = null);
    Task<Either<IEnumerable<Hwid>, ValidationFailed>> GetHwidByDtoAsync(HwidDto hwidDto);
    Task<Hwid> GetHwidByIdAsync(long id);
    Task<bool> DeleteHwidAsync(long id, IDbTransaction? transaction = null);
}