using DbUp;

namespace Authentication.Database;

public class DatabaseInitializer
{
    public DatabaseInitializer(string? connectionString)
    {
        ConnectionString = connectionString;
    }

    private string? ConnectionString { get; }

    public async Task InitializeAsync()
    {
        EnsureDatabase.For.PostgresqlDatabase(ConnectionString);

        var upgrader = DeployChanges.To.PostgresqlDatabase(ConnectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly).LogToConsole().Build();

        if (upgrader.IsUpgradeRequired())
        {
            var result = upgrader.PerformUpgrade();
        }
    }
}