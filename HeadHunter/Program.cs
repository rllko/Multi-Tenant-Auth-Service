using HeadHunter.Endpoints;
using HeadHunter.Endpoints.OAuth;
using HeadHunter.Endpoints.ProtectedResources;
using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;
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

app.UseWhen(
    context => context.Request.Headers ["Authorization"].ToString().StartsWith("Bearer"),
    builder => builder.UseMiddleware<AuthorizationMiddleware>()
);

app.UseAuthentication();
app.UseAuthorization();

//https://dev.to/mohammedahmed/build-your-own-oauth-20-server-and-openid-connect-provider-in-aspnet-core-60-1g1m
app.UseHttpsRedirection();

app.MapGet("/skibidiAuth/authorize", AuthorizationEndpoint.Handle);

app.MapPost("/skibidiAuth/token", TokenEndpoint.Handle);

app.MapGet("/skibidiAuth/create", CreateEndpoint.Handle);

app.MapPost("/skibidiAuth/confirm-token", ConfirmDiscordEndpoint.Handle);

// login
app.MapGet("1391220247", ClientLoginEndpoint.Handle);
// redeem
app.MapPost("2198251026", ClientRedeemEndpoint.Handle);
// refresh
app.MapPost("2283439600", ClientRefreshEndpoint.Handle);

app.MapGet("teapot", (HttpContext ctx) =>
{
    ctx.Response.StatusCode = StatusCodes.Status418ImATeapot;
    ctx.Response.WriteAsync(
        """
        <html>
            <body style='background: black;margin:auto;max-width: 50vw;'>
                <img src='https://http.cat/418' />
            </body>
        </html>
        """);
});

app.Run();