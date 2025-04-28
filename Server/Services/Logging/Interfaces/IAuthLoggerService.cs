using Authentication.Logging.Enums;

namespace Authentication.Logging.Interfaces;

public interface IAuthLoggerService
{
    void LogEvent(AuthEventType eventType, string tenantId, object? extraData = null);
}