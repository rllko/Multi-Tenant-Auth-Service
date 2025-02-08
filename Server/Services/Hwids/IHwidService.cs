using Authentication.Models.Entities;
using Authentication.Validators;
using LanguageExt;

namespace Authentication.Services.Hwids;

public interface IHwidService
{
    Task<Hwid> GetHwidByIdAsync(long licenseId);
    Task<Hwid> GetHwidBySessionTokenAsync(string token);
    Task<Either<bool, ValidationFailed>> AssignLicenseHwidAsync(string license, Hwid hwid);
    Task<bool> DeleteLicenseHwidAsync(string license);
    Task<Either<List<License>?, ValidationFailed>> GetLicensesByHwidAsync(Hwid hwid);
}