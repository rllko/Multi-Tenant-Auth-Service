using Authentication.Database;
using MigrationUtility.Database;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ => new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_URL")));

var app = builder.Build();

var databaseInitializer = app.Services.GetRequiredService<DatabaseInitializer>();
databaseInitializer.InitializeAsync();
