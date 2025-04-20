using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

public class TeamTenant
{
    public long Id { get; init; }
    public Guid InvitedBy { get; init; }
    public Guid TeamId { get; init; }
    public Guid TenantId { get; init; }
    public int RoleId { get; init; }
    public DateTime CreatedAt { get; init; }
}