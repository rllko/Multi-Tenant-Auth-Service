using System.Data;
using Authentication.Models.Entities;
using LanguageExt;

namespace Authentication.Services.Applications;

public interface IApplicationService
{
    Task<Option<ApplicationDto>> GetApplicationByIdAsync(Guid applicationId);
    Task<IEnumerable<ApplicationDto>> GetAllApplicationsAsync();
    Task<Option<IEnumerable<ApplicationDto>>> GetApplicationsByTeamIdAsync(Guid teamId);

    Task<Result<ApplicationDto, ValidationFailed>> RegisterApplicationAsync(Guid teamId,
        CreateApplicationDto applicationDto);
    Task<ApplicationDto> UpdateApplicationAsync(Guid applicationId, UpdateApplicationDto applicationDto,
        IDbTransaction transaction);

    Task<bool> DeleteApplicationAsync(Guid applicationId, IDbTransaction? transaction);
}