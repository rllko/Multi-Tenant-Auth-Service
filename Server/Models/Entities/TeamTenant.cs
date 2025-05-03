using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("team_tenants")]
public class TeamTenant
{
    [Key]
    public long Id { get; set; }
    public Guid? InvitedBy { get; set; }
    public Guid? Tenant { get; set; }
    public Guid? Team { get; set; }
    public int? Role { get; set; }
    public long CreatedAt { get; set; }
}