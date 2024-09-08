using HeadHunter.Endpoints;
using HeadHunter.Endpoints.OAuth;
using HeadHunter.Models.Context;
using HeadHunter.Services.CodeService;
using HeadHunter.Services.Interfaces;
using HeadHunter.Services.Users;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ICodeStoreService, CodeStoreService>();
builder.Services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();

builder.Services.AddScoped<IAuthorizeResultService, AuthorizeResultService>();

builder.Services.AddHttpContextAccessor();

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

//https://dev.to/mohammedahmed/build-your-own-oauth-20-server-and-openid-connect-provider-in-aspnet-core-60-1g1m
app.UseHttpsRedirection();

app.MapGet(".well-known/openid-configuration", OpenIdConfiguration.Handler);

app.MapGet("/skibidiAuth/authorize", AuthorizationEndpoint.Handle);

app.MapPost("/skibidiAuth/token", TokenEndpoint.Handle);

app.MapGet("/skibidiAuth/create", CreateEndpoint.Handle);

app.MapGet("/authorize", ClientLoginEndpoint.Handle);

app.Run();