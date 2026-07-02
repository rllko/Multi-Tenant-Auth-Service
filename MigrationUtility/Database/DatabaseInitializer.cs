using DbUp;

namespace MigrationUtility.Database;

public class DatabaseInitializer
{
    public DatabaseInitializer(string? connectionString, Func<string, bool>? scriptFilter = null)
    {
        ConnectionString = connectionString;
        ScriptFilter = scriptFilter ?? (script => script.Contains(".Scripts."));
    }

    private string? ConnectionString { get; }
    private Func<string, bool> ScriptFilter { get; }

    public void InitializeAsync()
    {
        EnsureDatabase.For.PostgresqlDatabase(ConnectionString);

        var upgrade = DeployChanges.To.PostgresqlDatabase(ConnectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly, ScriptFilter).LogToConsole()
            .WithVariablesDisabled()
            .Build();

        if (upgrade.IsUpgradeRequired())
        {
            var result = upgrade.PerformUpgrade();
        }
    }
}
