namespace Authentication.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(Guid teamId);
}

public record DashboardDto(
    int Members,
    int Roles,
    int Apps,
    int AppsInactive,
    int LicensesTotal,
    int LicensesActive,
    int LicensesPaused,
    int PendingInvites,
    int SignInsLast24H,
    IEnumerable<LicensesPerDayDto> LicensesPerDay,
    IEnumerable<DashboardActivityDto> RecentActivity);

public record LicensesPerDayDto(DateTime Date, int Count);

public record DashboardActivityDto(
    string Description,
    string Type,
    DateTime Timestamp,
    string UserName);
