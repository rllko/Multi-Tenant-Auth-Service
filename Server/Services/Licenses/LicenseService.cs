using System.Data;
using Authentication.Database;
using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;
using Authentication.Validators;
using FluentValidation;
using LanguageExt;

namespace Authentication.Services.Licenses;

public class LicenseService(IValidator<License> validator, IDbConnectionFactory connectionFactory) : ILicenseService
{
    public Task<List<License>> GetLicensesByDiscordId(long discordId)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByIdAsync(long licenseId)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByValueAsync(long license)
    {
        throw new NotImplementedException();
    }

    public Task<Either<Models.Entities.SessionToken, ValidationFailed>> GetSessionByLicenseAsync(License license)
    {
        throw new NotImplementedException();
    }

    public Task<License?> GetLicenseByCreationDateAsync(DateTime license)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ResetLicenseHwidAsync(long id)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteLicenseAsync(long id)
    {
        throw new NotImplementedException();
    }

    public async Task<List<License>> GetAllLicensesAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<bool> UpdateUserLicenseListAsync(ulong oldDiscordId, ulong newDiscordId, List<License> licenses)
    {
        throw new NotImplementedException();
    }

    public async Task<Either<License, ValidationFailed>> UpdateLicenseAsync(License license, IDbTransaction? transaction = null)
    {
        throw new NotImplementedException();
    }

    public async Task<Either<DiscordCode, ValidationFailed>> CreateLicenseRegistrationCodeAsync(License license)
    {
        throw new NotImplementedException();
    }
}