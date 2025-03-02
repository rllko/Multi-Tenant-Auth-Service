using Authentication.Database;
using Dapper;
using FluentValidation.Results;

namespace Authentication.Services.Licenses.Accounts;

public class AccountService(
    IDbConnectionFactory connectionFactory,
    ILicenseService licenseService
) : IAccountService
{
    public async Task<bool> PauseAllSubscriptions()
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            UPDATE Licenses SET paused = TRUE,last_paused_at = NOW() WHERE paused = false;
        ";
        var affected = await connection.ExecuteAsync(query);
        return affected > 0;
    }

    public async Task<Result<bool, ValidationFailed>> ResumeLicense(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
                    UPDATE licenses
                    SET expires_at = expires_at + EXTRACT(EPOCH FROM (NOW() - last_paused_at))::BIGINT
                    WHERE username = @username;
        ";

        var affected = await connection.ExecuteAsync(query, new { username });
        return affected > 0;
    }

    public async Task<Result<bool, ValidationFailed>> ResumeAllSubscriptions()
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
        UPDATE licenses
        SET expires_at = expires_at + EXTRACT(EPOCH FROM (NOW() - last_paused_at))::BIGINT
        WHERE last_paused_at IS NOT NULL;
        ";

        var affected = await connection.ExecuteAsync(query);
        return affected > 0;
    }

    public async Task<Result<bool, ValidationFailed>> ChangeAccountPassword(string oldPassword, string newPassword,
        string username)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(oldPassword) || string.IsNullOrEmpty(newPassword))
        {
            var error = new ValidationFailure("error", "username and password are required");
            return new ValidationFailed(error);
        }

        var isPasswordValid = await CheckLicensePassword(username, oldPassword);

        if (isPasswordValid is false) return false;

        var connection = await connectionFactory.CreateConnectionAsync();

        var hashedPassword = PasswordHashing.HashPassword(newPassword);

        var addDiscordIdQuery =
            @"UPDATE licenses
	        SET password = @password WHERE username = @username;";

        var affected =
            await connection.ExecuteAsync(addDiscordIdQuery, new { password = hashedPassword, username });

        return affected > 0;
    }

    public async Task<Result<bool, ValidationFailed>> ChangeAccountEmail(string newEmail, string oldEmail,
        string password)
    {
        if (string.IsNullOrEmpty(newEmail) || string.IsNullOrEmpty(oldEmail) || string.IsNullOrEmpty(password))
        {
            var error = new ValidationFailure("error", "email and password are required");
            return new ValidationFailed(error);
        }

        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "SELECT password FROM licenses WHERE email = @username;";
        var existingPw = await connection.QuerySingleOrDefaultAsync<string>(query, new { email = oldEmail });

        if (existingPw is null)
        {
            var error = new ValidationFailure("error", "old email or password is invalid");
            return new ValidationFailed(error);
        }

        var addDiscordIdQuery =
            @"UPDATE licenses
	        SET email = @email WHERE username = @username;";

        var affected =
            await connection.ExecuteAsync(addDiscordIdQuery, new { email = newEmail });

        return affected > 0;
    }

    public async Task<Result<bool, ValidationFailed>> PauseLicense(Guid username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            UPDATE Licenses 
            SET paused = TRUE,last_paused_at = NOW()
            WHERE username = @username AND paused = FALSE;
        ";

        var affected = await connection.ExecuteAsync(query, new { username });
        return affected > 0;
    }

    public async Task<Result<long, ValidationFailed>> GetRemainingTime(string username)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string query = @"
            SELECT EXTRACT(EPOCH FROM (NOW() - expires_at))::BIGINT 
            FROM Licenses
            WHERE username = @username;
        ";

        return await connection.ExecuteScalarAsync<long>(query, new { username });
    }

    public async Task<bool> CheckLicensePassword(string username, string password)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password)) return false;

        var connection = await connectionFactory.CreateConnectionAsync();

        var query = "SELECT password FROM Licenses WHERE username = @username AND activated = TRUE";
        var result = await connection.QuerySingleOrDefaultAsync<string>(query, new { username, password });

        if (result == null) return false;

        var isPasswordValid = PasswordHashing.ValidatePassword(password, result);
        if (isPasswordValid is false) return false;

        return true;
    }
}