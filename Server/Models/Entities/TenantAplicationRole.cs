using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("tenant_application_role")]
public class TenantApplicationRole
{
    [Key]
    public int Id { get; set; }
    public Guid TenantId { get; set; }
    public int RoleId { get; set; }  // Note: references SCOPES, not ROLES.
    public Guid ApplicationId { get; set; }
}