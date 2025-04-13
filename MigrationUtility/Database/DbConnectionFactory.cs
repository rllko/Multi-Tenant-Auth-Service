using System.Data;
using Npgsql;

namespace Authentication.Database;

public class NpgsqlDbConnectionFactory(string? connectionString) : IDbConnectionFactory
{
    private readonly string? _connectionString = connectionString;

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