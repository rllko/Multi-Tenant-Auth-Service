using System.ComponentModel.DataAnnotations;

namespace Authentication.Models.Entities;

public class Scope
{
    [Key] public int ScopeId { get; set; }

    public string ScopeName { get; set; }
    public int ScopeType { get; set; }
    public string Slug { get; set; }
    public Guid? CreatedBy { get; set; }
    public int? ImpactLevelId { get; set; }
    public int? CategoryId { get; set; }
}

public record ScopeCreateDto(
    string ScopeName,
    int ScopeType,
    string Slug,
    Guid CreatedBy,
    int? ImpactLevelId,
    int? CategoryId
);