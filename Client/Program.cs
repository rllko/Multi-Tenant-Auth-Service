using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

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
        options.SaveTokens = false;

        options.RequireHttpsMetadata = false;

        options.Scope.Clear();
        options.Scope.Add("openid");

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
            }
        };

        options.Events = new OpenIdConnectEvents
        {
            OnAuthorizationCodeReceived = context =>
            {
                // You can inspect or modify the token here
                // Handle authentication failures


                return Task.CompletedTask;
            },
            OnTokenResponseReceived = (context) =>
            {
                var tokenResponse = context.TokenEndpointResponse;
                var id_token = context.TokenEndpointResponse?.AccessToken;
                var token = context.TokenEndpointResponse?.IdToken;

                IMemoryCache cache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
                cache.Set("message", id_token, TimeSpan.FromMinutes(60));

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {

                //context.HandleResponse();
                //context.Response.WriteAsJsonAsync(new { Error = context.Exception.Message });
                return Task.CompletedTask;
            }
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

app.MapGet("/", (HttpContext context) => Results.Challenge());

app.Run();