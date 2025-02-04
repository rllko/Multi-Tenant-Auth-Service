using DbUp;

namespace HeadHunter.Database;

public class DatabaseInitializer(string connectionString)
{
    private readonly string _connectionString = "Host=localhost;Port=5432;Pooling=true;Database=auth;User Id=postgres;Password=postgres;";
    
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