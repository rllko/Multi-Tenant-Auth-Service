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

    public virtual DbSet<Hwid> Hwids { get; set; }

    public virtual DbSet<Offset> Offsets { get; set; }

    public virtual DbSet<Scope> Scopes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserActivityLog> Useractivitylogs { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.ClientId).HasName("clients_pkey");

            entity.HasMany(d => d.Scopes).WithMany(p => p.Clients)
                .UsingEntity<Dictionary<string, object>>(
                    "ClientScope",
                    r => r.HasOne<Scope>().WithMany()
                        .HasForeignKey("ScopeId")
                        .HasConstraintName("client_scopes_scope_id_fkey"),
                    l => l.HasOne<Client>().WithMany()
                        .HasForeignKey("ClientId")
                        .HasConstraintName("client_scopes_client_id_fkey"),
                    j =>
                    {
                        j.HasKey("ClientId", "ScopeId").HasName("client_scopes_pkey");
                        j.ToTable("client_scopes");
                        j.IndexerProperty<int>("ClientId").HasColumnName("client_id");
                        j.IndexerProperty<int>("ScopeId").HasColumnName("scope_id");
                    });
        });

        modelBuilder.Entity<DiscordUser>(entity =>
        {
            entity.HasKey(e => e.DiscordId).HasName("discord_users_pkey");

            entity.Property(e => e.DiscordId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Hwid>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("hwids_pkey");
        });

        modelBuilder.Entity<Offset>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pk_person");
        });

        modelBuilder.Entity<Scope>(entity =>
        {
            entity.HasKey(e => e.ScopeId).HasName("scopes_pkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.Property(e => e.CreationDate).HasDefaultValueSql("now()");
            entity.Property(e => e.KeyResetCount).HasDefaultValue(0);

            entity.HasOne(d => d.DiscordUserNavigation).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("users_discord_user_fkey");

            entity.HasOne(d => d.Hw).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("users_hwid_fkey");
        });

        modelBuilder.Entity<UserActivityLog>(entity =>
        {
            entity.HasKey(e => e.Useractivitylogid).HasName("useractivitylog_pkey");

            entity.Property(e => e.Useractivitylogid).UseIdentityAlwaysColumn();
            entity.Property(e => e.Interactiontime).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.Useractivitylogs).HasConstraintName("useractivitylog_userid_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
