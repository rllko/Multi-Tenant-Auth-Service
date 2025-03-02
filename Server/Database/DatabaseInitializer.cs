using DbUp;

namespace Authentication.Database;

public class DatabaseInitializer
{
    public DatabaseInitializer(string? connectionString)
    {
        ConnectionString = connectionString;
    }

    private string? ConnectionString { get; }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    public async Task InitializeAsync()
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
    {
        EnsureDatabase.For.PostgresqlDatabase(ConnectionString);

        var upgrade = DeployChanges.To.PostgresqlDatabase(ConnectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly).LogToConsole().Build();

        if (upgrade.IsUpgradeRequired())
        {
            var result = upgrade.PerformUpgrade();
        }
    }
}