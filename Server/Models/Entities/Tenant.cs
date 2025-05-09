using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Authentication.Models.Entities;


[Table("tenants")]
public class Tenant
{
    public Tenant(Guid id, long discordId, string name, string email, long? activatedAt)
    {
        Id = id;
        DiscordId = discordId;
        Name = name;
        Email = email;
        ActivatedAt = activatedAt;
    }

    public Tenant()
    {
    }

        [Key]
        public Guid Id { get; set; }
        public long? DiscordId { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public long CreationDate { get; set; }
        public string? Password { get; set; }
        public long? ActivatedAt { get; set; }

        public TenantDto ToDto() => new TenantDto()
        {
            Id = Id,
            Name = Name,
            Email = Email,
            
        };
}

public class TenantDto
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
}
