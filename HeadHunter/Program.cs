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
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ICodeStorageService, CodeStorageService>();
builder.Services.AddSingleton<IAcessTokenStorageService, AcessTokenStorageService>();

builder.Services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();

builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();

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
        SigningKeys = { new RsaSecurityKey(devKeys.RsaKey) }
    };

    x.TokenValidationParameters = new TokenValidationParameters
    {
        //ValidateIssuerSigningKey = true,
        ValidateAudience = true,
        ValidAudience = IdentityData.Audience,
        ValidIssuer = IdentityData.Issuer,
        ValidateIssuer = true,
        //IssuerSigningKey = new RsaSecurityKey(devKeys.RsaKey),

        ValidateLifetime = true,
    };

    x.Events = new()
    {
        OnMessageReceived = context =>
        {

            if(context.Request.Headers.TryGetValue("Authorization", out var Token))
            {
                context.Token = Token;
                //context.Success();
            }
            return Task.CompletedTask;
        },
    };

    x.MapInboundClaims = false;
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(IdentityData.GenerateUserClaimName, p => p.RequireClaim("nigga", "nigga"));
});

var connectionString = builder.Configuration["BaseDBConnection"];
builder.Services.AddDbContext<HeadhunterDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IUserManagerService, UserManagerService>();

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

app.MapGet("/skibidiAuth/create", CreateEndpoint.Handle).RequireAuthorization(x => x.RequireClaim("nigga"));

app.MapGet("authorize", ClientLoginEndpoint.Handle);

app.MapGet("authenticate", (HttpContext context) =>
{
    var claims = new[]
            {
                new Claim("FullName","Fiqri Ismail"),
                new Claim(JwtRegisteredClaimNames.Sub, "user_id")
            };

    var keyBytes = Encoding.UTF8.GetBytes("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    var key = new SymmetricSecurityKey(keyBytes);

    var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
                IdentityData.Audience,
                IdentityData.Issuer,
                claims,
                notBefore: DateTime.Now,
                expires: DateTime.Now.AddHours(1),
                signingCredentials);

    var tokenString = new  JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { accessToken = tokenString });
});


app.Run();