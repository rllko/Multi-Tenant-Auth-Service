using DbUp;

namespace Authentication.Database;

public class DatabaseInitializer(string? connectionString)
{
    private readonly string _connectionString = "";

    public async Task InitializeAsync()
    {
        EnsureDatabase.For.PostgresqlDatabase(_connectionString);

        var upgrader = DeployChanges.To.PostgresqlDatabase(_connectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly).LogToConsole().Build();

        if (upgrader.IsUpgradeRequired())
        {
            var result = upgrader.PerformUpgrade();
        }
    }
}