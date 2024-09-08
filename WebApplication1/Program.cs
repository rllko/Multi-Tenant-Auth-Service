using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddSingleton<IHttpContextAccessor,
           HttpContextAccessor>();

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(config =>
{
    config.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
    {
        options.Authority = "https://localhost:5069";
        options.ClientId = "defaultChangeLater";
        options.ClientSecret = "123456789";
        options.ResponseType = "code";
        options.CallbackPath = "/signin-oidc";

        options.RequireHttpsMetadata = false;

        options.Scope.Clear();
        options.Scope.Add("openid");

        //enable to get all claims
        //options.GetClaimsFromUserInfoEndpoint = true;

        // Disables the automatic claim mapping that microsoft has
        options.MapInboundClaims = false;
        options.SaveTokens = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = "https://localhost:5069",
            ValidAudience = "defaultChangeLater",

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,

            SignatureValidator = (string token, TokenValidationParameters _) =>
            {
                if(string.IsNullOrEmpty(token))
                {
                    throw new SecurityTokenInvalidSignatureException("Token is null or empty.");
                }

                return new JsonWebToken(token);
            },
        };

        options.Events.OnAuthenticationFailed = context =>
        {
            context.HandleResponse();
            context.Response.WriteAsJsonAsync(new { Error = context.Exception.Message });
            return Task.CompletedTask;
        };

    });

builder.Services.AddMemoryCache(o =>
{
    o.ExpirationScanFrequency = TimeSpan.FromMinutes(60);
});

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if(app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (ctx, next) =>
{
    if(!ctx.User.Identity?.IsAuthenticated ?? false)
    {
        // Trigger authentication challenge
        await ctx.ChallengeAsync(OpenIdConnectDefaults.AuthenticationScheme);
        return;
    }

    await next(ctx);
});

app.MapGet("/", async (HttpContext context) =>
{
    // Authenticate Client Credentials
    var hello = await context.AuthenticateAsync();
    if(!hello.Succeeded)
    {
        return Results.BadRequest();
    }

    // Sign the user out after successful authentication
    await context.SignOutAsync();

    return Results.Json(new
    {
        Claims = hello.Principal.Claims.Select(claim => new { claim.Type, claim.Value }).ToList(),
        IdToken = hello.Properties.GetTokenValue("id_token"),
        accessToken = hello.Properties.GetTokenValue("access_token"),
        TokenType = hello.Properties.GetTokenValue("token_type"),
        Issued = hello.Properties.Items [".issued"],
        Expires = hello.Properties.Items [".expires"],
    });
});

app.Run();