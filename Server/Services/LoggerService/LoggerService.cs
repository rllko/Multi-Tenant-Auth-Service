using System.Data;
using Authentication.Services.LoggerService;
using Npgsql;
using NpgsqlTypes;
using Serilog;
using Serilog.Sinks.PostgreSQL;
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
        Serilog.Debugging.SelfLog.Enable(Console.Error);

        var columnWriters = new Dictionary<string, ColumnWriterBase>
        {
            { "id", new IdColumnWriter() },
            {
                "tenant_id",
                new SinglePropertyColumnWriter("TenantId", PropertyWriteMethod.ToString, NpgsqlDbType.Text, "l")
            },
            {
                "event_type",
                new SinglePropertyColumnWriter("EventType", PropertyWriteMethod.ToString, NpgsqlDbType.Text, "l")
            },
            { "level", new LevelColumnWriter(true) },
            { "message", new RenderedMessageColumnWriter() },
            { "timestamp", new TimestampColumnWriter() },
            { "exception", new ExceptionColumnWriter() },
            { "properties", new LogEventSerializedColumnWriter() },
            {
                "machine_name",
                new SinglePropertyColumnWriter("MachineName", PropertyWriteMethod.ToString, NpgsqlDbType.Text, "l")
            }
        };

        return new LoggerConfiguration()
            .Enrich.FromLogContext()
            .Enrich.WithProperty("MachineName", Environment.MachineName)
            .WriteTo.Console()
            // only persist tenant events, not the request-log firehose
            .WriteTo.Logger(lc => lc
                .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("TenantId"))
                .WriteTo.PostgreSQL(
                    _connectionString,
                    "activity_logs",
                    columnWriters
                ));
    }

    public void logCLient()
    {
    }
}