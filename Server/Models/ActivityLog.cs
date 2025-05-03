namespace Authentication.Models;

public class ActivityLog
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Action { get; set; }
    public string? Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
    public string? TenantId { get; set; }
}