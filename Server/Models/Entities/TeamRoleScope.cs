using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("team_role_scopes")]
public class TeamRoleScope
{
    [Key]
    public int Int { get; set; }
    public int RoleId { get; set; }
    public int ScopeId { get; set; }
}