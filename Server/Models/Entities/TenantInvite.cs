namespace Authentication.Models.Entities;

public class TenantInvite
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid TeamId { get; set; }
    public int Status { get; set; }
    public string InviteToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? AcceptedAt { get; set; }
}

public class TenantInviteCreateDto
{
    public string Email { get; set; } = string.Empty;
    public string InviteMessage { get; set; } = string.Empty;
}

public class TenantInviteDto
{
    public string InviteToken { get; set; } = string.Empty;
    public string CreatedBy { get; set; }
    public string Status { get; set; }
    public string CreatedByEmail { get; set; }
    public string TeamName { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}