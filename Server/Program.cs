using Authentication.Database;
using Authentication.Services.Authentication.AuthorizeResult;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Authentication.OAuthAccessToken;
using Authentication.Services.Clients;
using Authentication.Services.Discords;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Builder;
using Authentication.Services.Offsets;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);
// builder.Services.AddSwaggerGen();
builder.Services.AddFastEndpoints();

// Add migration singleton
builder.Services.AddSingleton(_ => new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

// Add db connection factory
builder.Services.AddSingleton<IDbConnectionFactory>(_ => new NpgsqlDbConnectionFactory(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

builder.Services.AddValidatorsFromAssemblyContaining<Program>(ServiceLifetime.Singleton);

builder.Services.AddSingleton<IAccessTokenStorageService, AccessTokenStorageService>();
builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();
builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IDiscordService, DiscordService>();
builder.Services.AddScoped<ILicenseBuilder, LicenseBuilder>();
builder.Services.AddScoped<IOffsetService, OffsetService>();
//builder.Endpoints.AddScoped<IActivityLogger, ActivityLogger>();

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
});

//sets secrets, will throw if not found 
var symmetricKey = File.ReadAllText(@"/app/secrets/symmetricKey");

Environment.SetEnvironmentVariable("SYM_KEY", symmetricKey);
Environment.SetEnvironmentVariable("CHACHA", File.ReadAllText(@"/app/secrets/Chacha20"));

builder.Services.AddAuthenticationJwtBearer(s => { s.SigningKey = symmetricKey; });

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

var app = builder.Build();

app.UseCors(myAllowSpecificOrigins);

var databaseInitializer = app.Services.GetRequiredService<DatabaseInitializer>();
await databaseInitializer.InitializeAsync();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseAuthentication();
app.UseFastEndpoints(c => c.Binding.UsePropertyNamingPolicy = true);
app.UseAuthorization();

app.MapGet("/", ctx =>
    ctx.Response.WriteAsync(
        """
        <html>
            <head></head>
            <body style="background:black">
            <style>
            *{
            color:white;
            font-size:0.7em
            }
                img {
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    width: 50%;
                }
            </style>
            Server v1.0
            <img style="margin:auto" draggable="false" src='https://http.cat/418' />
            </body>
        </html>
        """));

app.Run();