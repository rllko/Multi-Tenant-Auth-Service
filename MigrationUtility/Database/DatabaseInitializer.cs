using DbUp;

namespace MigrationUtility.Database;

public class DatabaseInitializer
{
    public DatabaseInitializer(string? connectionString)
    {
        ConnectionString = connectionString;
    }

    private string? ConnectionString { get; }

    public void InitializeAsync()
    {
        EnsureDatabase.For.PostgresqlDatabase(ConnectionString);

        var upgrade = DeployChanges.To.PostgresqlDatabase(ConnectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly).LogToConsole().WithVariablesDisabled()
            .Build();

        if (upgrade.IsUpgradeRequired())
        {
            var result = upgrade.PerformUpgrade();
        }
    }
}