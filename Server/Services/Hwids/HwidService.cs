using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Validators;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Hwids;

public class HwidService(IValidator<Hwid> validator, IDbConnectionFactory connectionFactory) : IHwidService
{
    public async Task<Hwid> GetHwidByIdAsync(long licenseId)
    {
        throw new NotImplementedException();
    }

    public async Task<Hwid> GetHwidBySessionTokenAsync(string token)
    {
        throw new NotImplementedException();
    }

    public async Task<Either<bool, ValidationFailed>> AssignLicenseHwidAsync(string license, Hwid hwid)
    {
        var validationResult = await validator.ValidateAsync(hwid);

        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        var connection = await connectionFactory.CreateConnectionAsync();
    }

    public async Task<bool> DeleteLicenseHwidAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<Either<List<License>?, ValidationFailed>> GetLicensesByHwidAsync(Hwid hwid)
    {
        var validationResult = await validator.ValidateAsync(hwid);

        if (validationResult.IsValid is false) return new ValidationFailed(validationResult.Errors);

        var connection = await connectionFactory.CreateConnectionAsync();
    }

    public async Task<List<License>> GetLicensesByHwid(string license)
    {
        throw new NotImplementedException();
    }
}