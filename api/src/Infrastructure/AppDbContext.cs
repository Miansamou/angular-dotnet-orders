using Domain;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> opt) : DbContext(opt)
{
    public DbSet<Product> Products => Set<Product>();
    
    public DbSet<User> Users => Set<User>();
    
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Email).HasMaxLength(160).IsRequired();
            e.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
        });
    }
}