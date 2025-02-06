using Npgsql;

namespace Authentication.Abstracts.Persistence;

public class DapperContext : IPgsqlConnectionProvider
{
    public NpgsqlConnection GetConnection()
    {
        Console.WriteLine(Environment.GetEnvironmentVariable("DATABASE_URL"));
        return new NpgsqlConnection(Environment.GetEnvironmentVariable("DATABASE_URL"));
    }
}