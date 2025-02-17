using Authentication.Endpoints;

namespace Authentication.Services.Accounts;

public interface IAccountService
{
    Task PauseAllSubscriptions();
    Task<Result<bool, ValidationFailed>> ResumeAllSubscriptions();
    Task<Result<bool, ValidationFailed>> ChangeAccountPassword(string oldPassword, string newPassword, string username);
    Task<Result<bool, ValidationFailed>> ChangeAccountEmail(string newEmail, string username, string password);
}