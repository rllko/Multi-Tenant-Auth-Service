using System.Data;
using Npgsql;
using Serilog;
using Serilog.Sinks.PostgreSQL.ColumnWriters;

namespace Authentication.Services.Logger;

public class LoggerService : ILoggerService
{
    private readonly string _connectionString;

    public LoggerService()
    {
        _connectionString = Environment.GetEnvironmentVariable("DATABASE_LOGGER_URL")
                            ?? throw new InvalidOperationException("DATABASE_LOGGER_URL not configured.");
    }

    public async Task<IDbConnection> GetLoggerConnectionAsync(CancellationToken token = default)
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(token);
        return connection;
    }

    public LoggerConfiguration ConfigureLogger()
    {
        var columnWriters = new Dictionary<string, ColumnWriterBase>
        {
            { "id", new IdColumnWriter() },
            { "tenant_id", new SinglePropertyColumnWriter("TenantId") },
            { "level", new LevelColumnWriter(true) },
            { "message", new RenderedMessageColumnWriter() },
            { "timestamp", new TimestampColumnWriter() },
            { "exception", new ExceptionColumnWriter() },
            { "properties", new LogEventSerializedColumnWriter() },
            { "machine_name", new SinglePropertyColumnWriter("MachineName") }
        };

        return new LoggerConfiguration()
            .Enrich.FromLogContext()
            .Enrich.WithProperty("MachineName", Environment.MachineName)
            .WriteTo.PostgreSQL(
                connectionString: _connectionString,
                tableName: "activity_logs",
                columnOptions: columnWriters,
                needAutoCreateTable: true
            );
    }
}