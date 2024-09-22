using HeadHunter.Common;
using HeadHunter.Context;
using HeadHunter.Endpoints;
using HeadHunter.Endpoints.OAuth;
using HeadHunter.Endpoints.ProtectedResources;
using HeadHunter.Services;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Interfaces;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;

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
});


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


// Authorization Code to Brearer Middleware
app.UseWhen(
    context => context.Request.Headers ["Authorization"].ToString().StartsWith("Bearer"),
    builder => builder.UseMiddleware<AuthorizationMiddleware>()
);

app.UseAuthentication();
app.UseAuthorization();

//if(!app.Environment.IsDevelopment())
//{
app.UseHttpsRedirection();
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

// Check Discord Code and get user info
app.MapPost("/skibidiAuth/confirm-discord-license", ConfirmDiscordEndpoint.Handle).RequireAuthorization();

// Login Sign In
app.MapGet("1391220247", ClientLoginEndpoint.HandleGet);

// Add HWID to reset License
app.MapPost("1391220247", ClientLoginEndpoint.HandlePost);

// Use License to obtain discord code
app.MapPost("2198251026", ClientRedeemEndpoint.Handle);

// Refresh user token and get offsets
app.MapPost("2283439600", ClientRefreshEndpoint.Handle);

app.MapGet("/", (HttpContext ctx) =>
   Results.Content(
        """

        <style>
            img {
              display: block;
              margin-left: auto;
              margin-right: auto;
              width: 50%;
            }
        </style>

        <img style="margin:auto" draggable="false" src='https://http.cat/418' />
        """,
        statusCode: StatusCodes.Status418ImATeapot));

app.Run();