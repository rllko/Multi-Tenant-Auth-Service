using System.Data;
using Npgsql;

namespace Authentication.Database;

public class NpgsqlDbConnectionFactory : IDbConnectionFactory
{
    private readonly string? _connectionString;

    public NpgsqlDbConnectionFactory()
    {
        _connectionString = Environment.GetEnvironmentVariable("DATABASE_LOGGER_URL")
                            ?? throw new InvalidOperationException("DATABASE_LOGGER_URL not configured.");
    }
    
    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default)
    {
        var connection = new NpgsqlConnection(Environment.GetEnvironmentVariable("DATABASE_URL"));
        await connection.OpenAsync(token);
        return connection;
    }
}

public interface IDbConnectionFactory
{
    Task<IDbConnection> CreateConnectionAsync(CancellationToken token = default);
}