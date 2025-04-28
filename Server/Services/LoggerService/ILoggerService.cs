using System.Data;

namespace Authentication.Services.Logger;

public interface ILoggerService
{
    Task<IDbConnection> GetLoggerConnectionAsync(CancellationToken token = default);
}