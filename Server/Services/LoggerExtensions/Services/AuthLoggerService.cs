using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using Serilog;

namespace Authentication.Services.Logging.Services;

public class AuthLoggerService : IAuthLoggerService
{
    public void LogEvent(AuthEventType eventType, string tenantId, object? extraData = null)
    {
        Log
            .ForContext("TenantId", tenantId)
            .ForContext("EventType", eventType.ToString())
            .ForContext("ExtraData", extraData, true)
            .Information("OAuth event {EventType} for Tenant {TenantId}", eventType, tenantId);
    }
}