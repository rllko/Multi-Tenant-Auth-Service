using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;

namespace HeadHunter.Services.ActivityLogger;

public class ActivityLogger(HeadhunterDbContext dbContext) : IActivityLogger
{
    public async Task LogActivityAsync(ActivityType activityType, string ipAddress, long? targetId)
    {

        var activityLog = new Useractivitylog()
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
