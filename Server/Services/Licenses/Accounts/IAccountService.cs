using Authentication.Endpoints;

namespace Authentication.Services.Licenses.Accounts;

public interface IAccountService
{
    Task<bool> PauseAllSubscriptions();
    Task<Result<bool, ValidationFailed>> ResumeAllSubscriptions();
    Task<Result<bool, ValidationFailed>> ChangeAccountPassword(string oldPassword, string newPassword, string username);
    Task<Result<bool, ValidationFailed>> ChangeAccountEmail(string newEmail, string oldEmail, string password);
    Task<Result<long, ValidationFailed>> GetRemainingTime(string username);
    Task<Result<bool, ValidationFailed>> ResumeLicense(string username);
    Task<Result<bool, ValidationFailed>> PauseLicense(Guid username);
    Task<Result<bool, ValidationFailed>> CheckLicensePassword(string username, string password);
}