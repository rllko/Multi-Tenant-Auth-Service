using Authentication.Database;
using Authentication.Endpoints;
using Dapper;

namespace Authentication.Services.Accounts;

public class AccountService(IDbConnectionFactory connectionFactory) : IAccountService
{
    public async Task PauseAllSubscriptions()
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            UPDATE Licenses
            SET RemainingSeconds = RemainingSeconds - EXTRACT(EPOCH FROM (NOW() - LastStartedAt)),
                LastStartedAt = NULL,
                activated = FALSE
            WHERE LastStartedAt > now() - interval '30 day' AND activated = TRUE;
        ";
#warning dont forget to resume all sessions, good night rikko
        await connection.ExecuteAsync(query);
    }

    public  Task<Result<bool, ValidationFailed>> ResumeAllSubscriptions()
    {
        throw new NotImplementedException();
    }

    public  Task<Result<bool, ValidationFailed>> ChangeAccountPassword(string oldPassword, string newPassword,
        string username)
    {
        throw new NotImplementedException();
    }

    public  Task<Result<bool, ValidationFailed>> ChangeAccountEmail(string newEmail, string username,
        string password)
    {
        throw new NotImplementedException();
    }
}