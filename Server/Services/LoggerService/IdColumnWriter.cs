using NpgsqlTypes;
using Serilog.Events;
using Serilog.Sinks.PostgreSQL.ColumnWriters;

namespace Authentication.Services.LoggerService;

public class IdColumnWriter() : ColumnWriterBase(NpgsqlDbType.Uuid)
{
    public override object GetValue(LogEvent logEvent, IFormatProvider? formatProvider = null)
    {
        return Guid.NewGuid();
    }
}