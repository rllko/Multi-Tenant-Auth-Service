using System.ComponentModel.DataAnnotations;

namespace Authentication.Models.Entities;

public class Role
{
    [Key] public int RoleId { get; set; }

    public string RoleName { get; set; }
    public int RoleType { get; set; }
    public required string Description { get; init; }
    public Guid? CreatedBy { get; set; }

    public RoleDto ToDto()
    {
        return new RoleDto
        {
            RoleId = RoleId,
            RoleName = RoleName,
            CreatedBy = CreatedBy,
            Description = Description
        };
    }
}

public class RoleDto
{
    public int RoleId { get; set; }
    public required string RoleName { get; init; }
    public required string Description { get; init; }
    public Guid? CreatedBy { get; set; }
    public List<int> Scopes { get; set; }
}

public class CreateRoleDto
{
    public string Name { get; set; }
    public string Slug { get; set; }
    public int RoleType { get; set; }
    public string Description { get; init; }
    public Guid CreatedBy { get; set; }
}

public class UpdateRoleDto
{
    public string RoleName { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public int RoleType { get; set; }
    public Guid CreatedBy { get; set; }
}