using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddSingleton<IHttpContextAccessor,
           HttpContextAccessor>();

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(config =>
{
    config.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = "custom";
})
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddOAuth("custom", options =>
    {
        options.ClientId = "a72JD81Y76LH2D9Q";
        options.ClientSecret = "vK!@82msN7#$bTgF47Aq5pYx!Zw6E3";
        options.CallbackPath = "/signin-oidc";

        options.AuthorizationEndpoint = "https://localhost:5069/skibidiAuth/authorize";
        options.TokenEndpoint = "https://localhost:5069/skibidiAuth/token";

        options.Scope.Clear();
        options.Scope.Add("openid");
        options.Scope.Add("admin");
        //options.Scope.Add("profile");

        options.UsePkce = true;
        options.ClaimActions.MapUniqueJsonKey("id_token", "id_token");
        options.ClaimActions.MapUniqueJsonKey("scope", "scope");

        options.SaveTokens = true;
        options.Events.OnCreatingTicket = context =>
        {
            context.RunClaimActions(context.TokenResponse.Response.RootElement);
            return Task.CompletedTask;
        };

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
        await ctx.ChallengeAsync();
        return;
    }

    await next(ctx);
});

// Test Endpoint
app.MapGet("/", async (HttpContext context) =>
{
    // Authenticate Client Credentials
    var hello = await context.AuthenticateAsync();
    if(!hello.Succeeded)
    {
        return Results.BadRequest();
    }

    var list = new Dictionary<string,string>();

    list.Add("access_token", hello.Properties.GetTokenValue("access_token"));
    list.Add("token_type", hello.Properties.GetTokenValue("token_type"));

    foreach(var item in hello.Principal.Claims)
    {
        list.Add(item.Type, item.Value);
    }



    return Results.Json(list);
});

app.MapGet("/out", async (HttpContext context) =>
{
    await context.SignOutAsync();
    context.Response.Redirect("/");
});

app.Run();