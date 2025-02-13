using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Services.Authentication.AuthorizeResult;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Authentication.OAuthAccessToken;
using Authentication.Services.ClientComponents;
using Authentication.Services.CodeService;
using Authentication.Services.Licenses;
using FastEndpoints;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddFastEndpoints();

// Add migration singleton
builder.Services.AddSingleton(_ => new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

// Add db connection factory
builder.Services.AddSingleton<IDbConnectionFactory>(_ => new NpgsqlDbConnectionFactory(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

builder.Services.AddSingleton<IAcessTokenStorageService, AcessTokenStorageService>();
builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();
// builder.Services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();

builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<IOffsetService, OffsetService>();
//builder.Endpoints.AddScoped<IActivityLogger, ActivityLogger>();

// builder.Endpoints.AddAuthentication(x =>
// {
//     x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//     x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
// }).AddJwtBearer(x =>
// {
//     var devKeys = new DevKeys();
//     x.Configuration = new OpenIdConnectConfiguration
//     {
//         SigningKeys = { new RsaSecurityKey(devKeys.RsaSignKey) }
//     };
//
//     x.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuerSigningKey = true,
//         ValidateAudience = true,
//         ValidAudience = IdentityData.Audience,
//         ValidIssuer = IdentityData.Issuer,
//         ValidateIssuer = true,
//         IssuerSigningKey = new RsaSecurityKey(devKeys.RsaSignKey),
//
//         ValidateLifetime = true
//     };
//
//     x.Events = new JwtBearerEvents
//     {
//         OnMessageReceived = context =>
//         {
//             if (context.Request.Headers.TryGetValue("Authorization", out var AuthorizationToken))
//                 context.AuthorizationToken = AuthorizationToken;
//             return Task.CompletedTask;
//         }
//     };
//
//     x.MapInboundClaims = false;
// });

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

var databaseInitializer = app.Services.GetRequiredService<DatabaseInitializer>();
await databaseInitializer.InitializeAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(myAllowSpecificOrigins);

app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (contextFeature is not null)
        {
            Console.WriteLine($"Error: {contextFeature.Error}");

            if (context.Request.Path.StartsWithSegments("/skibidiAuth"))
                await context.Response.WriteAsJsonAsync(
                    new ExceptionResponse
                    (contextFeature.Error.Message,
                        contextFeature.Error.StackTrace));

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        }
    });
});

//app.UseAuthentication();
app.UseFastEndpoints(c => c.Binding.UsePropertyNamingPolicy = true);
//app.UseAuthorization();

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