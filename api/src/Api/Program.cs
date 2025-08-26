using System.Text;
using Application.Dto;
using Domain;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddPersistence(builder.Configuration);

var jwt = builder.Configuration.GetSection("Jwt");
var keyStr = jwt["Key"];
if (string.IsNullOrWhiteSpace(keyStr)) throw new InvalidOperationException("Missing Jwt:Key");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = key
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/products", async (AppDbContext db) =>
    await db.Products.AsNoTracking().ToListAsync()).RequireAuthorization();

app.MapPost("/products", async (AppDbContext db, Product p) =>
{
    db.Products.Add(p);
    await db.SaveChangesAsync();
    return Results.Created($"/products/{p.Id}", p);
}).RequireAuthorization();

app.MapPost("/users", async (AppDbContext db, RegisterUserDto dto) =>
{
    var name = dto.Name?.Trim() ?? "";
    var email = dto.Email?.Trim().ToLowerInvariant() ?? "";
    var pwd = dto.Password ?? "";

    
    if (name.Length < 2) return Bad("name","Nome inválido");
    if (!email.Contains('@')) return Bad("email","Email inválido");
    if (pwd.Length < 6) return Bad("password","Senha inválida");

    if (await db.Users.AnyAsync(u => u.Email == email))
        return Results.Conflict(new { message = "Email já cadastrado" });

    var hash = BCrypt.Net.BCrypt.HashPassword(pwd, workFactor: 12);

    var user = new User { Name = name, Email = email, PasswordHash = hash };
    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Created($"/users/{user.Id}", new { user.Id, user.Name, user.Email, user.CreatedAt });
});

app.MapPost("/auth/login", async (Infrastructure.AppDbContext db, LoginDto dto) =>
{
    var email = (dto.Email ?? "").Trim().ToLowerInvariant();
    var pwd = dto.Password ?? "";

    var user = await db.Users.AsNoTracking()
        .Where(u => u.Email == email)
        .Select(u => new { u.Id, u.Name, u.Email, u.PasswordHash })
        .SingleOrDefaultAsync();

    if (user is null || !BCrypt.Net.BCrypt.Verify(pwd, user.PasswordHash))
        return Results.Unauthorized();

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var jwtToken = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
        issuer: jwt["Issuer"],
        audience: jwt["Audience"],
        claims:
        [
            new System.Security.Claims.Claim("sub", user.Id.ToString()),
            new System.Security.Claims.Claim("name", user.Name),
            new System.Security.Claims.Claim("email", user.Email)
        ],
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );
    var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(jwtToken);

    return Results.Ok(new { access_token = token, token_type = "Bearer", expires_in = 8 * 3600 });
});

app.Run();

static IResult Bad(string f, string m) =>
    Results.ValidationProblem(new Dictionary<string,string[]> { { f, [m] } });

