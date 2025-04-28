using System.ComponentModel.DataAnnotations;

namespace Authentication.Models.Entities;

public class Role
{
    [Key]
    public int RoleId { get; set; }
    public string RoleName { get; set; }
    public string Slug { get; set; }
    public int RoleType { get; set; }
    public Guid? CreatedBy { get; set; }
}