using System.Data;
using Serilog;

namespace Authentication.Services.Logger;

public interface ILoggerService
{
    Task<IDbConnection> GetLoggerConnectionAsync(CancellationToken token = default);

}