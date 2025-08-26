using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration cfg)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(cfg.GetConnectionString("Default")));
        return services;
    }
}