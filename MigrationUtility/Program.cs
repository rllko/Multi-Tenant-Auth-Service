using MigrationUtility.Database;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// main auth database
var databaseInitializer = new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_URL"));
databaseInitializer.InitializeAsync();

// serilog activity log database
var loggerDatabaseInitializer = new DatabaseInitializer(
    Environment.GetEnvironmentVariable("DATABASE_LOGGER_URL"),
    script => script.Contains(".LoggerScripts."));
loggerDatabaseInitializer.InitializeAsync();
