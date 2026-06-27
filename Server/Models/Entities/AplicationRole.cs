using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

[Table("application_role")]
public class ApplicationRole
{
    [Key] public int Id { get; set; }

    public int RoleId { get; set; }
    public Guid ApplicationId { get; set; }
}