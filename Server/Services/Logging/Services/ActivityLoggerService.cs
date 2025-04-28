using Authentication.Logging.Enums;
using Authentication.Logging.Interfaces;
using Serilog;

namespace Authentication.Logging.Services;

public class ActivityLoggerService : IActivityLoggerService
{

    public ActivityLoggerService()
    {
    }

    public void LogEvent(ActivityEventType eventType,string userId, string tenantId, object? extraData = null)
    {
        Log
            .ForContext("UserId", userId ?? "unknown")
            .ForContext("TenantId", tenantId ?? "unknown")
            .ForContext("EventType", eventType.ToString())
            .ForContext("ExtraData", extraData, destructureObjects: true)
            .Information("User activity {EventType} for User {UserId} on Tenant {TenantId}",
                eventType, userId ?? "unknown", tenantId ?? "unknown");
    }
}