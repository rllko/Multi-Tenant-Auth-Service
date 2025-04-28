namespace Authentication.Services.Tenants;

public class DashboardStats
{
    public int TotalApps { get; set; }
    public int TotalUsers { get; set; }
    public int TotalSessions { get; set; }
    public int ActiveKeys { get; set; }
    public ApiRequests ApiRequests { get; set; }
    public NewUsers NewUsers { get; set; }
    public List<ActivityLog>? RecentActivity { get; set; }
}

public class ApiRequests
{
    public int Today { get; set; }
    public int ThisWeek { get; set; }
    public int ThisMonth { get; set; }
}

public class NewUsers
{
    public int Today { get; set; }
    public int ThisWeek { get; set; }
    public int ThisMonth { get; set; }
}