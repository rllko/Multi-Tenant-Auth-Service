using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Models.Context;

public partial class HeadhunterContext : DbContext
{
    public HeadhunterContext()
    {
    }

    public HeadhunterContext(DbContextOptions<HeadhunterContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Serial> Serials { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

        => optionsBuilder.UseNpgsql("Host=localhost;Database=headhunter;Username=postgres;Password=rlkko");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Serial>(entity =>
        {
            entity.HasKey(e => e.License).HasName("serials_pkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
