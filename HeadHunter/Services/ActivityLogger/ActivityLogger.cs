using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;

namespace HeadHunter.Services.ActivityLogger;

public class ActivityLogger(HeadhunterDbContext dbContext) : IActivityLogger
{
    public async Task LogActivityAsync(long userId, ActivityType activityType, string ipAddress)
    {

        var activityLog = new UserActivityLog()
        {
            Userid = userId,
            Activitytype = activityType.ToString(),
            Ipaddress = ipAddress,
            Interactiontime = DateTime.Now
        };

        await dbContext.Useractivitylogs.AddAsync(activityLog);
        await dbContext.SaveChangesAsync();
    }
}
