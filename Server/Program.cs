using Authentication.AuthenticationHandlers;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.HostedServices;
using Authentication.Services.Applications;
using Authentication.Services.Authentication.AccessToken;
using Authentication.Services.Authentication.AuthorizeResult;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Clients;
using Authentication.Services.Discords;
using Authentication.Services.Hwids;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Accounts;
using Authentication.Services.Licenses.Builder;
using Authentication.Services.Licenses.Sessions;
using Authentication.Services.Logger;
using Authentication.Services.Logging.Interfaces;
using Authentication.Services.Logging.Services;
using Authentication.Services.Roles;
using Authentication.Services.Scopes;
using Authentication.Services.Teams;
using Authentication.Services.Tenants;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Writers;
using Redis.OM;
using Serilog;
using Serilog.Debugging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHostedService<EnvironmentVariableService>();

builder.Services
    .AddAuthenticationJwtBearer(s =>
    {
        s.SigningKey = Environment.GetEnvironmentVariable(EnvironmentVariableService.SignKeyName);
    })
    .AddFastEndpoints()
    .AddAntiforgery()
    .AddAuthorization()
    .AddAuthentication(o =>
    {
        o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddScheme<AuthenticationSchemeOptions, LicenseSessionAuth>(LicenseSessionAuth.SchemeName, null);

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

builder.Services.AddSingleton<IAccessTokenService, AccessTokenService>();
builder.Services.AddSingleton<ICodeService, CodeService>();
builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<IHwidService, HwidService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ILicenseSessionService, LicenseSessionService>();
builder.Services.AddScoped<IDiscordService, DiscordService>();
builder.Services.AddScoped<ILicenseBuilder, LicenseBuilder>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IAuthLoggerService, AuthLoggerService>();
builder.Services.AddScoped<IActivityLoggerService, ActivityLoggerService>();

builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IScopeService, ScopeService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IApplicationService,ApplicationService>();

//SelfLog.Enable(Console.Error);
var loggerService = new LoggerService();

Log.Logger = loggerService.ConfigureLogger().CreateLogger();

builder.Logging.AddSerilog(Log.Logger);

builder.Host.UseSerilog(Log.Logger);

//builder.Logging.ClearProviders();
#warning add this when testing

var yuh = await loggerService.GetLoggerConnectionAsync();

builder.Services.AddSingleton<ILoggerService, LoggerService>();

builder.Services.AddSingleton<IDbConnectionFactory>(_ => new NpgsqlDbConnectionFactory());

builder.Services.AddValidatorsFromAssemblyContaining<Program>(ServiceLifetime.Singleton);

builder.Services.AddSingleton(new RedisConnectionProvider(Environment.GetEnvironmentVariable("REDIS_URL")!));
builder.Services.AddHostedService<IndexCreationService>();

var app = builder.Build();

app.UseCors(myAllowSpecificOrigins);

app.UseAuthentication()
    .UseSerilogRequestLogging()
    .UseAuthorization()
    .UseAntiforgeryFE()
    .UseFastEndpoints(c => c.Binding.UsePropertyNamingPolicy = true);

app.Run();