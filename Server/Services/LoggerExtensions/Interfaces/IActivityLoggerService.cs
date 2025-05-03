using Authentication.Services.Logging.Enums;

namespace Authentication.Services.Logging.Interfaces;

public interface IActivityLoggerService
{
    void LogEvent(ActivityEventType eventType, string userId, string tenantId, object? extraData = null);
}