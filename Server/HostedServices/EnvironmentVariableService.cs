namespace Authentication.HostedServices;

public class EnvironmentVariableService : IHostedService
{
    public const string SignKeyName = "SIGN_KEY";
    
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var symmetricKey = await File.ReadAllTextAsync(@"/app/secrets/symmetricKey",
            cancellationToken);

        Environment.SetEnvironmentVariable(SignKeyName, symmetricKey);
        Environment.SetEnvironmentVariable("CHACHA", await File.ReadAllTextAsync(@"/app/secrets/Chacha20",
            cancellationToken));
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}