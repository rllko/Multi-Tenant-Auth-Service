using Authentication.Logging.Enums;

namespace Authentication.Logging.Interfaces;

public interface IActivityLoggerService
{
    void LogEvent(ActivityEventType eventType, string userId, string tenantId, object? extraData = null);
}