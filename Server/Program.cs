using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Endpoints.Sessions;
using Authentication.Services.Authentication.AuthorizeResult;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Authentication.OAuthAccessToken;
using Authentication.Services.Clients;
using Authentication.Services.Discords;
using Authentication.Services.Hwids;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Accounts;
using Authentication.Services.Licenses.Builder;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Redis.OM;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

//sets secrets, will throw if not found 
var symmetricKey = File.ReadAllText(@"/app/secrets/symmetricKey");

Environment.SetEnvironmentVariable("SYM_KEY", symmetricKey);
Environment.SetEnvironmentVariable("CHACHA", File.ReadAllText(@"/app/secrets/Chacha20"));

builder.Services
    .AddAuthenticationJwtBearer(s => { s.SigningKey = symmetricKey; })
    .AddAuthenticationCookie(validFor: TimeSpan.FromMinutes(10)) //configure cookie auth
    .AddFastEndpoints()
    .AddAntiforgery()
    .AddAuthorization()
    .AddAuthentication(o =>
    {
        o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddScheme<AuthenticationSchemeOptions, SessionAuth>(SessionAuth.SchemeName, null);

builder.Services.AddAuthentication(DiscordBasicAuth.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, DiscordBasicAuth>(DiscordBasicAuth.SchemeName, null);

const string myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(myAllowSpecificOrigins,
        policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddSingleton<IAccessTokenStorageService, AccessTokenStorageService>();
builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();
builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<IHwidService, HwidService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ILicenseSessionService, LicenseSessionService>();
builder.Services.AddScoped<IDiscordService, DiscordService>();
builder.Services.AddScoped<ILicenseBuilder, LicenseBuilder>();

builder.Services.AddSingleton<IDbConnectionFactory>(_ => new NpgsqlDbConnectionFactory(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

builder.Services.AddValidatorsFromAssemblyContaining<Program>(ServiceLifetime.Singleton);

builder.Services.AddSingleton(new RedisConnectionProvider(Environment.GetEnvironmentVariable("REDIS_URL")!));

var app = builder.Build();
app.UseCors(myAllowSpecificOrigins);

app.UseAuthentication()
    .UseAuthorization()
    .UseAntiforgeryFE()
    .UseFastEndpoints(c => c.Binding.UsePropertyNamingPolicy = true);

app.Run();