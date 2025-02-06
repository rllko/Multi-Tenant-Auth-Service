namespace Authentication.Services.ActivityLogger;

public interface IActivityLogger
{
    public Task LogActivityAsync(ActivityType activityType, string ipAddress, long? targetId = null);
}