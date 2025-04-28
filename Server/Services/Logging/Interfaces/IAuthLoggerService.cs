using Authentication.Services.Logging.Enums;

namespace Authentication.Services.Logging.Interfaces;

public interface IAuthLoggerService
{
    void LogEvent(AuthEventType eventType, string tenantId, object? extraData = null);
}