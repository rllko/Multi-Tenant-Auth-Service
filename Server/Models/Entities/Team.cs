using System.ComponentModel.DataAnnotations;

namespace Authentication.Models.Entities;

public class Team
{
    [Key] public Guid Id { get; set; }

    public string Name { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public TeamDto ToDto()
    {
        return new TeamDto
        {
            Id = Id,
            Name = Name,
            CreatedBy = CreatedBy,
            CreatedAt = CreatedAt
        };
    }
}

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TeamCreateDto
{
    public string Name { get; set; }
}

public class TeamUpdateDto
{
    public string Name { get; set; }
}