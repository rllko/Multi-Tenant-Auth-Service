using Authentication.Models.Context;
using Authentication.Models.Entities;

namespace Authentication.Services.ActivityLogger;

public class ActivityLogger(AuthenticationDbContext dbContext) : IActivityLogger
{
    public async Task LogActivityAsync(ActivityType activityType, string ipAddress, long? targetId)
    {
        var activityLog = new Useractivitylog
        {
            Targetid = targetId,
            Activitytype = activityType.ToString(),
            Ipaddress = ipAddress,
            Interactiontime = DateTime.Now
        };

        await dbContext.Useractivitylogs.AddAsync(activityLog);
        await dbContext.SaveChangesAsync();
    }
}