using System.Data;
using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Hwids;

public interface IHwidService
{
    Task<Either<Hwid?, ValidationFailed>> CreateHwidAsync(HwidDto hwidDto, IDbTransaction? transaction = null);
    Task<Either<List<Hwid>, ValidationFailed>> GetHwidByDtoAsync(HwidDto hwidDto);
    Task<bool> DeleteHwidAsync(long id, IDbTransaction? transaction = null);
}