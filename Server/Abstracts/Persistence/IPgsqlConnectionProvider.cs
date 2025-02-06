using Npgsql;

namespace Authentication.Abstracts.Persistence;

public interface IPgsqlConnectionProvider
{
    NpgsqlConnection GetConnection();
}