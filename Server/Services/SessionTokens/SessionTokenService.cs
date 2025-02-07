using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;

namespace Authentication.Services.SessionTokens;

public class SessionTokenService(IDbConnectionFactory connectionFactory) : ISessionTokenService
{
    public async Task<SessionToken> GetSessionByIdAsync(long id)
    {
        using var dbConnection = await connectionFactory.CreateConnectionAsync();

        var query = "SELECT * FROM session_tokens WHERE Id = @Id";

        return dbConnection.QueryFirst<SessionToken>(query, new { Id = id });
    }

    public async Task<SessionToken> GetSessionByLicenseAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> CreateLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ResetLicenseToken(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> UpdateLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteLicenseTokenAsync(string license)
    {
        throw new NotImplementedException();
    }

    public async Task<SessionToken> GetSessionByLicenseAsync()
    {
        throw new NotImplementedException();
    }
}