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


    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
