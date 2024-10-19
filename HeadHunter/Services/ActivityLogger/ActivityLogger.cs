using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;

namespace HeadHunter.Services.ActivityLogger;

public class ActivityLogger(HeadhunterDbContext dbContext) : IActivityLogger
{
    public async Task LogActivityAsync( ActivityType activityType, string ipAddress,long? userId)
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
