using HeadHunter.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Models.Context;

public partial class HeadhunterDbContext : DbContext
{
    public HeadhunterDbContext()
    {
    }

    public HeadhunterDbContext(DbContextOptions<HeadhunterDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<DiscordUser> DiscordUsers { get; set; }

    public virtual DbSet<Scope> Scopes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.ClientId).HasName("clients_pkey");
        });

        modelBuilder.Entity<DiscordUser>(entity =>
        {
            entity.HasKey(e => e.DiscordId).HasName("discord_users_pkey");

            entity.Property(e => e.DiscordId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Scope>(entity =>
        {
            entity.HasKey(e => e.ScopeId).HasName("scopes_pkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.HasOne(d => d.DiscordUserNavigation).WithMany(p => p.Users).HasConstraintName("users_discord_user_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
