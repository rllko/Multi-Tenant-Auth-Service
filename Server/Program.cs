using System.Threading.RateLimiting;
using Authentication.Abstracts.Persistence;
using Authentication.Common;
using Authentication.Database;
using Authentication.Endpoints;
using Authentication.Repositories.DiscordRepository;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// builder.Services.AddSingleton<IAcessTokenStorageService, AcessTokenStorageService>();
// builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();
//
// builder.Services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();
//
// builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
// builder.Services.AddScoped<ILicenseManagerService, UserManagerService>();
// builder.Services.AddScoped<IOffsetService, OffsetService>();
// builder.Services.AddScoped<IActivityLogger, ActivityLogger>();

builder.Services.AddSingleton(_ => new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<IDiscordRepository, DiscordRepository>();

// builder.Services.AddAuthentication(x =>
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
//             if (context.Request.Headers.TryGetValue("Authorization", out var Token))
//                 context.Token = Token;
//             return Task.CompletedTask;
//         }
//     };
//
//     x.MapInboundClaims = false;
// });

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("fixed", rateLimiterOptions =>
    {
        rateLimiterOptions.PermitLimit = 6;
        rateLimiterOptions.Window = TimeSpan.FromSeconds(10);
        rateLimiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        rateLimiterOptions.QueueLimit = 5;
    });
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Special", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "Scope" &&
                                       (c.Value == "admin" || c.Value == "license:write")
                                       && c.Issuer == IdentityData.Issuer)));

// var connectionString = builder.Configuration["BaseDBConnection"];
// builder.Services.AddDbContext<AuthenticationDbContext>(options => { options.UseNpgsql(connectionString); },
//     ServiceLifetime.Transient);


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
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

app.UseCors(MyAllowSpecificOrigins);

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

// Authorization Code to Brearer Middlewares
/*app.UseWhen(
    context => context.Request.Headers.Authorization.Count > 0,
    applicationBuilder => applicationBuilder.UseMiddleware<AuthorizationMiddleware>()
);

app.UseWhen(
    context => context.Request.Path.StartsWithSegments("/protected"),
    applicationBuilder => applicationBuilder.UseMiddleware<PersistenceMiddleware>()
);*/

//app.UseAuthentication();
app.UseRateLimiter();
//app.UseAuthorization();
app.MapControllers();

var oauthEndpoints = app.MapGroup("skibidiAuth");

/*
// OAuth Authorization Endpoint
oauthEndpoints.MapGet("authorize", AuthorizationController.Handle);

// OAuth Token Endpoint

oauthEndpoints.MapPost("token", TokenEndpoint.Handle);

// Create a new License
oauthEndpoints.MapGet("create", CreateEndpoint.Handle).RequireAuthorization();

// Create multiple Licenses
oauthEndpoints.MapGet("create-bulk", CreateEndpoint.HandleBulk).RequireAuthorization();

// Reset User License
oauthEndpoints.MapGet("reset-hwid/{discordId:long}/{license}", ResetHwidEndpoint.Handle).RequireAuthorization();

// Get User Liceses
oauthEndpoints.MapGet("get-licenses/{discordId:long}", LicenseEndpoint.Handle).RequireAuthorization();

// Set Offsets
oauthEndpoints.MapPost("cdn", DiscordOffsetEndpoint.HandlePost).RequireAuthorization();

// Set Offsets
oauthEndpoints.MapGet("cdn/{filename}", DiscordOffsetEndpoint.HandleGet).RequireAuthorization();

// Check Discord Code and get user info
oauthEndpoints.MapPost("confirm-discord-license", ConfirmDiscordEndpoint.Handle).RequireAuthorization();

// Persistence Controllers
var protectedRoutes = app.MapGroup("protected")
    .MapGet("2525546191/{filename}", OffsetsEndpoint.HandleGet); // Get Offsets

// Login Sign In
app.MapGet("1391220247", CustomerController.HandleGet);

// Add HWID to reset License
app.MapPost("1391220247", CustomerController.HandlePost);

// Use License to obtain discord code
app.MapPost("2198251026", ClientRedeemEndpoint.Handle);*/

// Refresh user token and get offsets
//app.MapPost("2283439600", ClientRefreshEndpoint.Handle).RequireAuthorization(); ;


app.MapGet("/", ctx =>
    ctx.Response.WriteAsync("""
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