using System.ComponentModel.DataAnnotations;

namespace Authentication.Models.Entities;

public class Role
{
    [Key] public int RoleId { get; set; }

    public string RoleName { get; set; }
    public string Slug { get; set; }
    public int RoleType { get; set; }
    public required string Description { get; init; }
    public Guid? CreatedBy { get; set; }
}

public class RoleDto
{
    public required string TeamId { get; init; }
    public required string RoleName { get; init; }
    public required string Description { get; init; }
    public required string Slug { get; init; }
    public required string RoleType { get; init; }
}

public class CreateRoleDto
{
    public string RoleName { get; set; }
    public string Slug { get; set; }
    public int RoleType { get; set; }
    public string Description { get; init; }
    public Guid CreatedByTeam { get; set; }
}

public class UpdateRoleDto
{
    public string RoleName { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public int RoleType { get; set; }
    public Guid CreatedByTeam { get; set; }
}