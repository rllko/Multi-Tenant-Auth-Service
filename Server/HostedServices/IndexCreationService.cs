using Authentication.Models;
using Redis.OM;

namespace Authentication.HostedServices;

public class IndexCreationService(RedisConnectionProvider provider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var info = (await provider.Connection.ExecuteAsync("FT._LIST"))
            .ToArray()
            .Select(x => x.ToString());
        if (info.All(x => x != "person-idx"))
        {
            await provider.Connection.CreateIndexAsync(typeof(TenantSessionInfo));
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}