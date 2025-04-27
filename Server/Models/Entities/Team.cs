using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;

public class Team
{
    private Guid Id { get; set; }
    public string? Name { get; set; }
    private Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? Password { get; set; }
    public long? ActivatedAt { get; set; }
}