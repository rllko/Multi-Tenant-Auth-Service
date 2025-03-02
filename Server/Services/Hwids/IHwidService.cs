using System.Data;
using Authentication.Models.Entities;

namespace Authentication.Services.Hwids;

public interface IHwidService
{
    Task<Hwid?> CreateHwidAsync(HwidDto hwidDto, IDbTransaction? transaction = null);
    Task<IEnumerable<Hwid>> GetHwidByDtoAsync(HwidDto hwidDto);
    Task<Hwid> GetHwidByIdAsync(long id);
    Task<bool> DeleteHwidAsync(long id, IDbTransaction? transaction = null);
}