namespace HeadHunter.Services.ActivityLogger;

public interface IActivityLogger
{
    public Task LogActivityAsync(long userId, ActivityType activityType, string ipAddress);

}
