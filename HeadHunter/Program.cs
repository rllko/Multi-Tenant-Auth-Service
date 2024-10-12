using HeadHunter.Common;
using HeadHunter.Endpoints;
using HeadHunter.Endpoints.OAuth;
using HeadHunter.Endpoints.ProtectedResources.DiscordOperations;
using HeadHunter.Models.Context;
using HeadHunter.Services;
using HeadHunter.Services.ClientComponents;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Interfaces;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddSingleton<IAcessTokenStorageService, AcessTokenStorageService>();
builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();

builder.Services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();
builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();
builder.Services.AddScoped<IUserManagerService, UserManagerService>();
builder.Services.AddScoped<ISoftwareComponents, SoftwareComponents>();

builder.Services.AddSingleton<DevKeys>();
var devKeys = new DevKeys();

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.Configuration = new OpenIdConnectConfiguration()
    {
        SigningKeys = { new RsaSecurityKey(devKeys.RsaSignKey) }
    };

    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidateAudience = true,
        ValidAudience = IdentityData.Audience,
        ValidIssuer = IdentityData.Issuer,
        ValidateIssuer = true,
        IssuerSigningKey = new RsaSecurityKey(devKeys.RsaSignKey),

        ValidateLifetime = true,
    };

    x.Events = new()
    {
        OnMessageReceived = context =>
        {
            if(context.Request.Headers.
            TryGetValue("Authorization", out var Token))
            {
                context.Token = Token;
            }
            return Task.CompletedTask;
        },
    };

    x.MapInboundClaims = false;
});

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
    // We'll talk about adding specific rate limiting policies later.
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Special", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "scope" &&
            (c.Value == "admin" || c.Value == "license:write")
            && c.Issuer == IdentityData.Issuer)));
});

var connectionString = builder.Configuration["BaseDBConnection"];
builder.Services.AddDbContext<HeadhunterDbContext>(options =>
{
    options.UseNpgsql(connectionString);
}, ServiceLifetime.Transient);


var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if(app.Environment.IsDevelopment())
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

        var ContextFeature = context.Features.Get<IExceptionHandlerFeature>();
        if(ContextFeature is not null)
        {
            Console.WriteLine($"Error: {ContextFeature.Error}");

            await context.Response.WriteAsJsonAsync(
                new
                {
                    ExceptionMessage = ContextFeature.Error.Message,
                    StackTrace = ContextFeature.Error.StackTrace,
                });
        }
    });
});

// Authorization Code to Brearer Middleware
app.UseWhen(
    context => context.Request.Headers ["Authorization"].ToString().StartsWith("Bearer"),
    builder => builder.UseMiddleware<AuthorizationMiddleware>()
);

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

//if(!app.Environment.IsDevelopment())
//{
//app.UseHttpsRedirection();
//}

// OAuth Authorization Endpoint
app.MapGet("/skibidiAuth/authorize", AuthorizationEndpoint.Handle);

// OAuth Token Endpoint
app.MapPost("/skibidiAuth/token", TokenEndpoint.Handle);

// Create a new License
app.MapGet("/skibidiAuth/create", CreateEndpoint.Handle).RequireAuthorization();

// Create multiple Licenses
app.MapGet("/skibidiAuth/create-bulk", CreateEndpoint.HandleBulk).RequireAuthorization();

// Reset User License
app.MapGet("/skibidiAuth/reset-hwid", ResetHwidEndpoint.Handle).RequireAuthorization();

// Get User Liceses
app.MapGet("/skibidiAuth/get-licenses", LicenseEndpoint.Handle).RequireAuthorization();

// Set Offsets
app.MapPost("/skibidiAuth/software-offsets", OffsetsEndpoint.HandlePost).RequireAuthorization();

// Check Discord Code and get user info
app.MapPost("/skibidiAuth/confirm-discord-license", ConfirmDiscordEndpoint.Handle).RequireAuthorization();

// Get Offsets
app.MapGet("2525546191", OffsetsEndpoint.HandleGet);

// Login Sign In
app.MapGet("1391220247", ClientLoginEndpoint.HandleGet);

// Add HWID to reset License
app.MapPost("1391220247", ClientLoginEndpoint.HandlePost);

// Use License to obtain discord code
app.MapPost("2198251026", ClientRedeemEndpoint.Handle);

// Refresh user token and get offsets
app.MapPost("2283439600", ClientRefreshEndpoint.Handle);

//app.MapGet("/", (HttpContext ctx) =>
//    ctx.Response.WriteAsync("""
//    <html>
//        <head></head>
//        <body style="background:black">
//        <style>
//        *{
//        color:white;
//        font-size:0.7em
//        }
//            img {
//                display: block;
//                margin-left: auto;
//                margin-right: auto;
//                width: 50%;
//            }
//        </style>
//        HeadHunter v1.0
//        <img style="margin:auto" draggable="false" src='https://http.cat/418' />
//        </body>
//    </html>
//    """));



app.Run();